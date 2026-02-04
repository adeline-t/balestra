const jsonResponse = (data, status = 200, extraHeaders = {}) => {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...extraHeaders,
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return jsonResponse({ ok: true });
    }

    if (url.pathname === '/api/health') {
      return jsonResponse({ ok: true });
    }

    if (url.pathname === '/api/items' && request.method === 'GET') {
      const { results } = await env.balestra_db.prepare(
        'SELECT id, name, created_at FROM items ORDER BY id DESC'
      ).all();
      return jsonResponse({ items: results });
    }

    if (url.pathname === '/api/items' && request.method === 'POST') {
      const body = await readBody(request);
      if (!body || typeof body.name !== 'string' || body.name.trim().length === 0) {
        return jsonResponse({ error: 'name is required' }, 400);
      }
      const name = body.name.trim();
      const createdAt = new Date().toISOString();
      await env.balestra_db.prepare(
        'INSERT INTO items (name, created_at) VALUES (?1, ?2)'
      ).bind(name, createdAt).run();

      return jsonResponse({ ok: true, item: { name, created_at: createdAt } }, 201);
    }

    if (url.pathname === '/api/evaluations' && request.method === 'GET') {
      const { results } = await env.balestra_db.prepare(
        'SELECT id, name, created_at FROM evaluations ORDER BY id DESC'
      ).all();
      return jsonResponse({ evaluations: results });
    }

    if (url.pathname === '/api/evaluations/latest' && request.method === 'GET') {
      const row = await env.balestra_db.prepare(
        'SELECT payload, name, created_at FROM evaluations ORDER BY id DESC LIMIT 1'
      ).first();

      if (!row) {
        return jsonResponse({ evaluation: null });
      }

      const parsed = safeParseJson(row.payload);
      return jsonResponse({
        evaluation: parsed,
        name: row.name,
        created_at: row.created_at
      });
    }

    if (url.pathname.startsWith('/api/evaluations/') && request.method === 'GET') {
      const id = url.pathname.split('/')[3];
      if (!id || Number.isNaN(Number(id))) {
        return jsonResponse({ error: 'invalid id' }, 400);
      }
      const row = await env.balestra_db.prepare(
        'SELECT id, name, payload, created_at FROM evaluations WHERE id = ?1'
      ).bind(id).first();
      if (!row) {
        return jsonResponse({ error: 'Not Found' }, 404);
      }
      const parsed = safeParseJson(row.payload);
      return jsonResponse({
        id: row.id,
        name: row.name,
        evaluation: parsed,
        created_at: row.created_at
      });
    }

    if (url.pathname === '/api/evaluations' && request.method === 'POST') {
      const body = await readBody(request);
      if (!body || typeof body.evaluation !== 'object') {
        return jsonResponse({ error: 'evaluation is required' }, 400);
      }
      if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
        return jsonResponse({ error: 'name is required' }, 400);
      }
      const createdAt = new Date().toISOString();
      await env.balestra_db.prepare(
        'INSERT INTO evaluations (name, payload, created_at) VALUES (?1, ?2, ?3)'
      ).bind(body.name.trim(), JSON.stringify(body.evaluation), createdAt).run();

      return jsonResponse({ ok: true, created_at: createdAt }, 201);
    }

    return jsonResponse({ error: 'Not Found' }, 404);
  },
};
