const jsonResponse = (data, status = 200, extraHeaders = {}) => {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    ...extraHeaders
  });
  return new Response(JSON.stringify(data), { status, headers });
};

const readBody = async (request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

const safeParseJson = (value) => {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const toBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
};

const randomSalt = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toBase64(bytes);
};

const hashPassword = async (password, salt) => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  return toBase64(derived);
};

const generateTechCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => alphabet[b % alphabet.length])
    .join("");
};

const createUniqueTechCode = async (env) => {
  for (let i = 0; i < 5; i += 1) {
    const code = generateTechCode();
    const existing = await env.balestra_db
      .prepare("SELECT id FROM combats WHERE tech_code = ?1")
      .bind(code)
      .first();
    if (!existing) return code;
  }
  return `${generateTechCode()}${Date.now().toString().slice(-3)}`;
};

const ensureBootstrap = async (env) => {
  const row = await env.balestra_db.prepare("SELECT COUNT(*) as count FROM users").first();
  if (row && row.count > 0) return;

  const salt = randomSalt();
  const passwordHash = await hashPassword("escrime", salt);
  await env.balestra_db
    .prepare("INSERT INTO users (email, password_hash, password_salt, role, created_at) VALUES (?1, ?2, ?3, ?4, ?5)")
    .bind("admin@balestra.local", passwordHash, salt, "superadmin", new Date().toISOString())
    .run();
};

const getAuthUser = async (request, env) => {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length);
  if (!token) return null;

  const row = await env.balestra_db
    .prepare(
      "SELECT u.id, u.email, u.role, s.token, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?1"
    )
    .bind(token)
    .first();

  if (!row) return null;
  if (row.expires_at && new Date(row.expires_at) < new Date()) return null;

  return { id: row.id, email: row.email, role: row.role, token: row.token };
};

const requireAuth = async (request, env) => {
  const user = await getAuthUser(request, env);
  if (!user) return { error: jsonResponse({ error: "Unauthorized" }, 401) };
  return { user };
};

const isSuperAdmin = (user) => user && user.role === "superadmin";

const hasCombatAccess = async (env, combatId, user) => {
  if (isSuperAdmin(user)) return true;
  const row = await env.balestra_db
    .prepare(
      "SELECT c.id FROM combats c LEFT JOIN combat_shares s ON s.combat_id = c.id AND s.user_id = ?2 WHERE c.id = ?1 AND (c.owner_user_id = ?2 OR s.user_id = ?2)"
    )
    .bind(combatId, user.id)
    .first();
  return !!row;
};

const canEditCombat = async (env, combatId, user) => {
  if (isSuperAdmin(user)) return true;
  const row = await env.balestra_db
    .prepare("SELECT id FROM combats WHERE id = ?1 AND owner_user_id = ?2")
    .bind(combatId, user.id)
    .first();
  return !!row;
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return jsonResponse({ ok: true });
    }

    if (url.pathname === "/api/health") {
      return jsonResponse({ ok: true });
    }

    await ensureBootstrap(env);

    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      const body = await readBody(request);
      if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
        return jsonResponse({ error: "email and password are required" }, 400);
      }

      const user = await env.balestra_db
        .prepare("SELECT id, email, role, password_hash, password_salt FROM users WHERE email = ?1")
        .bind(body.email.trim().toLowerCase())
        .first();

      if (!user) return jsonResponse({ error: "invalid credentials" }, 401);

      const check = await hashPassword(body.password, user.password_salt);
      if (check !== user.password_hash) return jsonResponse({ error: "invalid credentials" }, 401);

      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
      await env.balestra_db
        .prepare("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)")
        .bind(token, user.id, new Date().toISOString(), expiresAt)
        .run();

      return jsonResponse({
        token,
        user: { id: user.id, email: user.email, role: user.role }
      });
    }

    if (url.pathname === "/api/auth/me" && request.method === "GET") {
      const { user, error } = await requireAuth(request, env);
      if (error) return error;
      return jsonResponse({ user });
    }

    if (url.pathname === "/api/auth/logout" && request.method === "POST") {
      const auth = request.headers.get("Authorization");
      if (auth && auth.startsWith("Bearer ")) {
        const token = auth.slice("Bearer ".length);
        await env.balestra_db.prepare("DELETE FROM sessions WHERE token = ?1").bind(token).run();
      }
      return jsonResponse({ ok: true });
    }

    if (url.pathname === "/api/users" && request.method === "GET") {
      const { user, error } = await requireAuth(request, env);
      if (error) return error;
      if (!isSuperAdmin(user)) return jsonResponse({ error: "Forbidden" }, 403);

      const { results } = await env.balestra_db
        .prepare("SELECT id, email, role, created_at FROM users ORDER BY id DESC")
        .all();
      return jsonResponse({ users: results });
    }

    if (url.pathname === "/api/users/shareable" && request.method === "GET") {
      const { user, error } = await requireAuth(request, env);
      if (error) return error;
      const { results } = await env.balestra_db
        .prepare("SELECT id, email FROM users WHERE id != ?1 ORDER BY email ASC")
        .bind(user.id)
        .all();
      return jsonResponse({ users: results });
    }

    if (url.pathname === "/api/users" && request.method === "POST") {
      const { user, error } = await requireAuth(request, env);
      if (error) return error;
      if (!isSuperAdmin(user)) return jsonResponse({ error: "Forbidden" }, 403);

      const body = await readBody(request);
      if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
        return jsonResponse({ error: "email and password are required" }, 400);
      }
      const role = body.role === "superadmin" ? "superadmin" : "user";
      const email = body.email.trim().toLowerCase();
      const salt = randomSalt();
      const passwordHash = await hashPassword(body.password, salt);

      try {
        await env.balestra_db
          .prepare("INSERT INTO users (email, password_hash, password_salt, role, created_at) VALUES (?1, ?2, ?3, ?4, ?5)")
          .bind(email, passwordHash, salt, role, new Date().toISOString())
          .run();
      } catch {
        return jsonResponse({ error: "email already exists" }, 400);
      }

      return jsonResponse({ ok: true });
    }

    if (url.pathname.startsWith("/api/users/") && url.pathname.endsWith("/password") && request.method === "PATCH") {
      const { user, error } = await requireAuth(request, env);
      if (error) return error;
      if (!isSuperAdmin(user)) return jsonResponse({ error: "Forbidden" }, 403);

      const id = url.pathname.split("/")[3];
      if (!id || Number.isNaN(Number(id))) {
        return jsonResponse({ error: "invalid id" }, 400);
      }
      const body = await readBody(request);
      if (!body || typeof body.password !== "string" || body.password.trim().length === 0) {
        return jsonResponse({ error: "password is required" }, 400);
      }
      const salt = randomSalt();
      const passwordHash = await hashPassword(body.password.trim(), salt);
      const result = await env.balestra_db
        .prepare("UPDATE users SET password_hash = ?1, password_salt = ?2 WHERE id = ?3")
        .bind(passwordHash, salt, id)
        .run();
      if (result.changes === 0) return jsonResponse({ error: "Not Found" }, 404);
      return jsonResponse({ ok: true });
    }

    if (url.pathname === "/api/combats" && request.method === "GET") {
      const { user, error } = await requireAuth(request, env);
      if (error) return error;

      if (isSuperAdmin(user)) {
        const { results } = await env.balestra_db
          .prepare(
            "SELECT id, name, category, club, fencers, description, tech_code, created_at, owner_user_id, 0 as is_shared FROM combats ORDER BY id DESC"
          )
          .all();
        return jsonResponse({ combats: results });
      }

      const { results } = await env.balestra_db
        .prepare(
          "SELECT c.id, c.name, c.category, c.club, c.fencers, c.description, c.tech_code, c.created_at, c.owner_user_id, CASE WHEN c.owner_user_id != ?1 THEN 1 ELSE 0 END as is_shared FROM combats c LEFT JOIN combat_shares s ON s.combat_id = c.id AND s.user_id = ?1 WHERE c.owner_user_id = ?1 OR s.user_id = ?1 ORDER BY c.id DESC"
        )
        .bind(user.id)
        .all();
      return jsonResponse({ combats: results });
    }

    if (url.pathname === "/api/combats" && request.method === "POST") {
      const { user, error } = await requireAuth(request, env);
      if (error) return error;

      const body = await readBody(request);
      if (!body || typeof body.name !== "string" || body.name.trim().length === 0) {
        return jsonResponse({ error: "name is required" }, 400);
      }
      if (!body.category || typeof body.category !== "string" || body.category.trim().length === 0) {
        return jsonResponse({ error: "category is required" }, 400);
      }
      const club = typeof body.club === "string" ? body.club.trim() : "";
      const description = typeof body.description === "string" ? body.description.trim() : "";
      const fencers = Array.isArray(body.fencers) ? body.fencers : [];
      const techCode = await createUniqueTechCode(env);
      const createdAt = new Date().toISOString();
      await env.balestra_db
        .prepare(
          "INSERT INTO combats (name, category, club, fencers, description, tech_code, created_at, owner_user_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)"
        )
        .bind(
          body.name.trim(),
          body.category.trim(),
          club,
          JSON.stringify(fencers),
          description,
          techCode,
          createdAt,
          user.id
        )
        .run();
      return jsonResponse({ ok: true, created_at: createdAt, tech_code: techCode }, 201);
    }

    if (url.pathname.startsWith("/api/combats/") && request.method === "PATCH") {
      const { user, error } = await requireAuth(request, env);
      if (error) return error;

      const id = url.pathname.split("/")[3];
      if (!id || Number.isNaN(Number(id))) {
        return jsonResponse({ error: "invalid id" }, 400);
      }
      const canEdit = await canEditCombat(env, id, user);
      if (!canEdit) return jsonResponse({ error: "Forbidden" }, 403);

      const body = await readBody(request);
      if (!body || typeof body.name !== "string" || body.name.trim().length === 0) {
        return jsonResponse({ error: "name is required" }, 400);
      }
      if (!body.category || typeof body.category !== "string" || body.category.trim().length === 0) {
        return jsonResponse({ error: "category is required" }, 400);
      }
      const club = typeof body.club === "string" ? body.club.trim() : "";
      const description = typeof body.description === "string" ? body.description.trim() : "";
      const fencers = Array.isArray(body.fencers) ? body.fencers : [];
      const result = await env.balestra_db
        .prepare(
          "UPDATE combats SET name = ?1, category = ?2, club = ?3, fencers = ?4, description = ?5 WHERE id = ?6"
        )
        .bind(body.name.trim(), body.category.trim(), club, JSON.stringify(fencers), description, id)
        .run();
      if (result.changes === 0) return jsonResponse({ error: "Not Found" }, 404);
      return jsonResponse({ ok: true });
    }

    if (url.pathname.startsWith("/api/combats/") && request.method === "DELETE") {
      const { user, error } = await requireAuth(request, env);
      if (error) return error;

      const id = url.pathname.split("/")[3];
      if (!id || Number.isNaN(Number(id))) {
        return jsonResponse({ error: "invalid id" }, 400);
      }
      const canEdit = await canEditCombat(env, id, user);
      if (!canEdit) return jsonResponse({ error: "Forbidden" }, 403);

      await env.balestra_db
        .prepare("DELETE FROM combats WHERE id = ?1")
        .bind(id)
        .run();
      await env.balestra_db
        .prepare("DELETE FROM combat_shares WHERE combat_id = ?1")
        .bind(id)
        .run();
      return jsonResponse({ ok: true });
    }

    if (url.pathname.startsWith("/api/combats/") && url.pathname.endsWith("/share") && request.method === "POST") {
      const { user, error } = await requireAuth(request, env);
      if (error) return error;

      const id = url.pathname.split("/")[3];
      if (!id || Number.isNaN(Number(id))) {
        return jsonResponse({ error: "invalid id" }, 400);
      }
      const canEdit = await canEditCombat(env, id, user);
      if (!canEdit) return jsonResponse({ error: "Forbidden" }, 403);

      const body = await readBody(request);
      if (!body || typeof body.userId !== "number") {
        return jsonResponse({ error: "userId is required" }, 400);
      }
      await env.balestra_db
        .prepare("INSERT OR IGNORE INTO combat_shares (combat_id, user_id, created_at) VALUES (?1, ?2, ?3)")
        .bind(id, body.userId, new Date().toISOString())
        .run();

      return jsonResponse({ ok: true });
    }

    if (url.pathname.startsWith("/api/combats/") && url.pathname.endsWith("/shares") && request.method === "GET") {
      const { user, error } = await requireAuth(request, env);
      if (error) return error;

      const id = url.pathname.split("/")[3];
      if (!id || Number.isNaN(Number(id))) {
        return jsonResponse({ error: "invalid id" }, 400);
      }
      const canEdit = await canEditCombat(env, id, user);
      if (!canEdit) return jsonResponse({ error: "Forbidden" }, 403);

      const { results } = await env.balestra_db
        .prepare(
          "SELECT u.id, u.email FROM combat_shares s JOIN users u ON u.id = s.user_id WHERE s.combat_id = ?1 ORDER BY u.email ASC"
        )
        .bind(id)
        .all();
      return jsonResponse({ users: results });
    }

    if (url.pathname.includes("/share/") && request.method === "DELETE") {
      const { user, error } = await requireAuth(request, env);
      if (error) return error;

      const parts = url.pathname.split("/");
      const id = parts[3];
      const userId = parts[5];
      if (!id || Number.isNaN(Number(id)) || !userId || Number.isNaN(Number(userId))) {
        return jsonResponse({ error: "invalid id" }, 400);
      }
      const canEdit = await canEditCombat(env, id, user);
      if (!canEdit) return jsonResponse({ error: "Forbidden" }, 403);

      await env.balestra_db
        .prepare("DELETE FROM combat_shares WHERE combat_id = ?1 AND user_id = ?2")
        .bind(id, userId)
        .run();
      return jsonResponse({ ok: true });
    }

    if (url.pathname.startsWith("/api/combats/") && url.pathname.endsWith("/evaluation") && request.method === "GET") {
      const { user, error } = await requireAuth(request, env);
      if (error) return error;

      const id = url.pathname.split("/")[3];
      if (!id || Number.isNaN(Number(id))) {
        return jsonResponse({ error: "invalid id" }, 400);
      }
      const canAccess = await hasCombatAccess(env, id, user);
      if (!canAccess) return jsonResponse({ error: "Forbidden" }, 403);

      const row = await env.balestra_db
        .prepare("SELECT id, payload, created_at FROM evaluations WHERE combat_id = ?1 AND author_user_id = ?2")
        .bind(id, user.id)
        .first();
      if (!row) return jsonResponse({ evaluation: null });

      return jsonResponse({
        id: row.id,
        evaluation: safeParseJson(row.payload),
        created_at: row.created_at
      });
    }

    if (url.pathname.startsWith("/api/combats/") && url.pathname.endsWith("/evaluation") && request.method === "POST") {
      const { user, error } = await requireAuth(request, env);
      if (error) return error;

      const id = url.pathname.split("/")[3];
      if (!id || Number.isNaN(Number(id))) {
        return jsonResponse({ error: "invalid id" }, 400);
      }
      const canAccess = await hasCombatAccess(env, id, user);
      if (!canAccess) return jsonResponse({ error: "Forbidden" }, 403);

      const body = await readBody(request);
      if (!body || typeof body.evaluation !== "object") {
        return jsonResponse({ error: "evaluation is required" }, 400);
      }

      const existing = await env.balestra_db
        .prepare("SELECT id FROM evaluations WHERE combat_id = ?1 AND author_user_id = ?2")
        .bind(id, user.id)
        .first();

      if (existing) {
        await env.balestra_db
          .prepare("UPDATE evaluations SET payload = ?1 WHERE id = ?2")
          .bind(JSON.stringify(body.evaluation), existing.id)
          .run();
        return jsonResponse({ ok: true, updated: true });
      }

      const createdAt = new Date().toISOString();
      await env.balestra_db
        .prepare(
          "INSERT INTO evaluations (name, payload, created_at, combat_id, author_user_id) VALUES (?1, ?2, ?3, ?4, ?5)"
        )
        .bind(body.name || "Evaluation", JSON.stringify(body.evaluation), createdAt, id, user.id)
        .run();

      return jsonResponse({ ok: true, created_at: createdAt }, 201);
    }

    return jsonResponse({ error: "Not Found" }, 404);
  }
};
