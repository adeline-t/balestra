import React, { useEffect, useMemo, useState } from "react";
import InfoModal from "./components/InfoModal.jsx";
import ContextSection from "./components/ContextSection.jsx";
import PhraseForm from "./components/PhraseForm.jsx";
import PhraseTable from "./components/PhraseTable.jsx";
import Penalties from "./components/Penalties.jsx";
import Summary from "./components/Summary.jsx";
import {
  DIFFICULTIES,
  PENALTY_PRESETS,
  TIME_RULES,
  formatNumber,
  getCategoryInfo,
  getCategoryLabel,
  getModeFromCategory,
  parseMmss,
  toNumber,
  CATEGORY_OPTIONS,
} from "./data/rules.js";

const STORAGE_KEY = "balestra_evaluation_v1";
const AUTH_KEY = "balestra_auth_v1";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8787";

function buildCsv(
  phrases,
  penaltyTotal,
  computed,
  meta,
  penaltyCounts,
  disqualified,
) {
  const lines = [];
  lines.push(["meta", "categorie", getCategoryLabel(meta.category || "")]);
  lines.push(["meta", "duree_mmss", meta.duration || ""]);
  lines.push(["meta", "combat_mmss", meta.combatTime || ""]);
  lines.push(["meta", "nombre_coups", meta.hits || ""]);
  lines.push(["meta", "disqualifie", disqualified ? "oui" : "non"]);
  lines.push([]);
  lines.push([
    "index",
    "difficulte",
    "coefficient",
    "note_sur_5",
    "note_ponderee",
  ]);

  phrases.forEach((p, index) => {
    lines.push([
      index + 1,
      p.difficulty,
      p.coef,
      p.note,
      formatNumber(p.note * p.coef, 2),
    ]);
  });

  lines.push([]);
  lines.push(["resume", "moyenne_simple", formatNumber(computed.avgSimple, 2)]);
  lines.push([
    "resume",
    "moyenne_complexe",
    formatNumber(computed.avgComplexe, 2),
  ]);
  lines.push([
    "resume",
    "moyenne_avancee",
    formatNumber(computed.avgAvancee, 2),
  ]);
  lines.push([
    "resume",
    "moyenne_ponderee_sur_5",
    formatNumber(computed.avgWeighted, 2),
  ]);
  lines.push(["resume", "note_sur_10", formatNumber(computed.score10, 2)]);
  lines.push(["resume", "penalites", formatNumber(penaltyTotal, 2)]);
  lines.push([
    "resume",
    "note_finale",
    disqualified ? "DISQUALIFIE" : formatNumber(computed.finalScore, 2),
  ]);
  lines.push([]);
  lines.push(["penalites", "type", "occurrences", "valeur", "total"]);
  PENALTY_PRESETS.forEach((p) => {
    const count = toNumber(penaltyCounts[p.id], 0);
    lines.push([
      "penalites",
      p.label,
      count,
      p.value,
      p.value === "DQ" ? "DQ" : formatNumber(count * p.value, 2),
    ]);
  });

  return lines
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
}

export default function App() {
  const [phrases, setPhrases] = useState([]);
  const [difficulty, setDifficulty] = useState("");
  const [note, setNote] = useState("");
  const [penaltyCounts, setPenaltyCounts] = useState({});
  const [duration, setDuration] = useState("");
  const [combatTime, setCombatTime] = useState("");
  const [hits, setHits] = useState("");
  const [category, setCategory] = useState("");
  const [combatName, setCombatName] = useState("");
  const [combatId, setCombatId] = useState(null);
  const [combatCategory, setCombatCategory] = useState("");
  const [combatClub, setCombatClub] = useState("");
  const [combatFencers, setCombatFencers] = useState([]);
  const [combatDescription, setCombatDescription] = useState("");
  const [combatTechCode, setCombatTechCode] = useState("");
  const [newFencer, setNewFencer] = useState("");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [view, setView] = useState("index");
  const [editingCombatId, setEditingCombatId] = useState(null);
  const [combats, setCombats] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  const [indexStatus, setIndexStatus] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [users, setUsers] = useState([]);
  const [shareUsers, setShareUsers] = useState([]);
  const [shareTargets, setShareTargets] = useState({});
  const [shareLists, setShareLists] = useState({});
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");

  const apiFetch = async (path, options = {}) => {
    const headers = { ...(options.headers || {}) };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;
    return fetch(`${API_BASE}${path}`, { ...options, headers });
  };

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data.phrases)) setPhrases(data.phrases);
      if (data.penaltyCounts) setPenaltyCounts(data.penaltyCounts);
      if (data.duration !== undefined) setDuration(String(data.duration));
      if (data.combatTime !== undefined) setCombatTime(String(data.combatTime));
      if (data.hits !== undefined) setHits(String(data.hits));
      if (data.category !== undefined) setCategory(String(data.category));
      if (data.combatName !== undefined) setCombatName(String(data.combatName));
    } catch {
      // ignore corrupted storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        phrases,
        penaltyCounts,
        duration,
        combatTime,
        hits,
        category,
        combatName,
      }),
    );
  }, [
    phrases,
    penaltyCounts,
    duration,
    combatTime,
    hits,
    category,
    combatName,
  ]);

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.token) setAuthToken(data.token);
      if (data.user) setCurrentUser(data.user);
    } catch {
      // ignore auth storage
    }
  }, []);

  useEffect(() => {
    if (!authToken) return;
    const verify = async () => {
      try {
        const res = await apiFetch("/api/auth/me");
        if (!res.ok) throw new Error("invalid");
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem(
          AUTH_KEY,
          JSON.stringify({ token: authToken, user: data.user }),
        );
      } catch {
        setAuthToken("");
        setCurrentUser(null);
        localStorage.removeItem(AUTH_KEY);
      }
    };
    verify();
  }, [authToken]);

  const loadCombats = async (signal) => {
    setIndexStatus("");
    try {
      const res = await apiFetch("/api/combats", { signal });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setCombats(Array.isArray(data.combats) ? data.combats : []);
    } catch {
      if (!signal || !signal.aborted)
        setIndexStatus("Impossible de charger les combats.");
    }
  };

  const loadShareUsers = async () => {
    try {
      const res = await apiFetch("/api/users/shareable");
      if (!res.ok) return;
      const data = await res.json();
      setShareUsers(Array.isArray(data.users) ? data.users : []);
    } catch {
      // ignore
    }
  };

  const loadAdminUsers = async () => {
    if (!currentUser || currentUser.role !== "superadmin") return;
    try {
      const res = await apiFetch("/api/users");
      if (!res.ok) return;
      const data = await res.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!authToken) return;
    const controller = new AbortController();
    loadCombats(controller.signal);
    loadShareUsers();
    loadAdminUsers();
    return () => controller.abort();
  }, [authToken, currentUser?.role]);

  const selectedMode = useMemo(() => getModeFromCategory(category), [category]);
  const timeRule = selectedMode ? TIME_RULES[selectedMode] : null;
  const durationSeconds = useMemo(() => parseMmss(duration), [duration]);
  const combatSeconds = useMemo(() => parseMmss(combatTime), [combatTime]);
  const categoryInfo = useMemo(() => getCategoryInfo(category), [category]);

  const combatMinSeconds = useMemo(() => {
    return timeRule ? parseMmss(timeRule.combatMin) : null;
  }, [timeRule]);

  const autoCombatPenalty = useMemo(() => {
    if (!timeRule || combatSeconds === null || combatMinSeconds === null)
      return 0;
    return combatSeconds < combatMinSeconds - 10 ? 1 : 0;
  }, [timeRule, combatSeconds, combatMinSeconds]);

  const perfPenaltyCount = useMemo(() => {
    if (!timeRule || durationSeconds === null) return 0;
    const totalSeconds = parseMmss(timeRule.total);
    if (totalSeconds === null) return 0;
    if (durationSeconds <= totalSeconds + 30) return 0;
    const over = durationSeconds - (totalSeconds + 30);
    return 1 + Math.floor(over / 10);
  }, [timeRule, durationSeconds]);

  const effectivePenaltyCounts = useMemo(() => {
    const next = { ...penaltyCounts };
    next.g2_temps_combat =
      toNumber(next.g2_temps_combat, 0) + autoCombatPenalty;
    return next;
  }, [penaltyCounts, autoCombatPenalty]);

  const penaltyTotal = useMemo(() => {
    return PENALTY_PRESETS.reduce((sum, p) => {
      if (p.value === "DQ") return sum;
      const count = toNumber(effectivePenaltyCounts[p.id], 0);
      return sum + count * p.value;
    }, 0);
  }, [effectivePenaltyCounts]);

  const disqualified = useMemo(() => {
    return PENALTY_PRESETS.some(
      (p) => p.value === "DQ" && toNumber(effectivePenaltyCounts[p.id], 0) > 0,
    );
  }, [effectivePenaltyCounts]);

  const computed = useMemo(() => {
    const simple = phrases.filter((p) => p.difficulty === "simple");
    const complexe = phrases.filter((p) => p.difficulty === "complexe");
    const avancee = phrases.filter((p) => p.difficulty === "avancee");

    const avg = (list) =>
      list.length === 0
        ? 0
        : list.reduce((sum, p) => sum + p.note, 0) / list.length;

    const avgSimple = avg(simple);
    const avgComplexe = avg(complexe);
    const avgAvancee = avg(avancee);

    const weightedSum = phrases.reduce((sum, p) => sum + p.note * p.coef, 0);
    const avgWeighted = phrases.length === 0 ? 0 : weightedSum / phrases.length;
    const score10 = avgWeighted * 2;
    const finalScore = score10 - penaltyTotal;

    return {
      avgSimple,
      avgComplexe,
      avgAvancee,
      avgWeighted,
      score10,
      finalScore,
    };
  }, [phrases, penaltyTotal]);

  function addPhrase(nextDifficulty, nextNote) {
    const difficultyMeta = DIFFICULTIES.find((d) => d.value === nextDifficulty);
    const coef = difficultyMeta?.coef ?? 1;
    const noteValue = Math.min(5, Math.max(0, toNumber(nextNote, 0)));

    setPhrases((prev) => [
      ...prev,
      {
        difficulty: nextDifficulty,
        coef,
        note: noteValue,
      },
    ]);

    setDifficulty("");
    setNote("");
  }

  function handleDifficultyClick(nextDifficulty) {
    if (note) {
      addPhrase(nextDifficulty, note);
    } else {
      setDifficulty(nextDifficulty);
    }
  }

  function handleNoteClick(nextNote) {
    if (difficulty) {
      addPhrase(difficulty, nextNote);
    } else {
      setNote(nextNote);
    }
  }

  function handleRemove(index) {
    setPhrases((prev) => prev.filter((_, idx) => idx !== index));
  }

  function handleUpdatePhrase(index, nextDifficulty, nextNote) {
    const difficultyMeta = DIFFICULTIES.find((d) => d.value === nextDifficulty);
    const coef = difficultyMeta?.coef ?? 1;
    const noteValue = Math.min(5, Math.max(0, toNumber(nextNote, 0)));

    setPhrases((prev) =>
      prev.map((p, idx) =>
        idx === index
          ? {
              ...p,
              difficulty: nextDifficulty,
              coef,
              note: noteValue,
            }
          : p,
      ),
    );
  }

  function handleReset() {
    if (!confirm("Reinitialiser toutes les phrases ?")) return;
    resetEvaluation();
  }

  function handleExport() {
    const csv = buildCsv(
      phrases,
      penaltyTotal,
      computed,
      { category, duration, combatTime, hits },
      effectivePenaltyCounts,
      disqualified,
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `evaluation_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function resetEvaluation() {
    setPhrases([]);
    setPenaltyCounts({});
    setDuration("");
    setCombatTime("");
    setHits("");
    setCategory("");
    setDifficulty("");
    setNote("");
  }

  function applyEvaluation(evalData) {
    const safe = evalData || {};
    setPhrases(Array.isArray(safe.phrases) ? safe.phrases : []);
    setPenaltyCounts(safe.penaltyCounts || {});
    setDuration(safe.duration !== undefined ? String(safe.duration) : "");
    setCombatTime(safe.combatTime !== undefined ? String(safe.combatTime) : "");
    setHits(safe.hits !== undefined ? String(safe.hits) : "");
    setCategory(safe.category !== undefined ? String(safe.category) : "");
    setDifficulty("");
    setNote("");
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthError("");
    setIsBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail.trim().toLowerCase(),
          password: authPassword,
        }),
      });
      if (!res.ok) {
        setAuthError("Identifiants invalides.");
        return;
      }
      const data = await res.json();
      setAuthToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem(
        AUTH_KEY,
        JSON.stringify({ token: data.token, user: data.user }),
      );
      setAuthEmail("");
      setAuthPassword("");
      setView("index");
    } catch {
      setAuthError("Impossible de se connecter.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setAuthToken("");
    setCurrentUser(null);
    localStorage.removeItem(AUTH_KEY);
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    if (!newUserEmail.trim() || !newUserPassword.trim()) return;
    setIsBusy(true);
    try {
      const res = await apiFetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUserEmail.trim(),
          password: newUserPassword,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setNewUserEmail("");
      setNewUserPassword("");
      await loadAdminUsers();
      await loadShareUsers();
    } catch {
      setIndexStatus("Impossible de creer l'utilisateur.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleResetUserPassword(userId, email) {
    const next = prompt(`Nouveau mot de passe pour ${email} ?`, "");
    if (!next || !next.trim()) return;
    setIsBusy(true);
    try {
      const res = await apiFetch(`/api/users/${userId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: next.trim() }),
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      setIndexStatus("Impossible de reinitialiser le mot de passe.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCreateCombat() {
    setCombatId(null);
    setCombatName("");
    setCombatCategory("");
    setCombatClub("");
    setCombatFencers([]);
    setCombatDescription("");
    setCombatTechCode("");
    setNewFencer("");
    setEditingCombatId(null);
    setView("combat-create");
  }

  async function handleOpenCombat(combat) {
    setIsBusy(true);
    try {
      const res = await apiFetch(`/api/combats/${combat.id}/evaluation`);
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      resetEvaluation();
      if (data.evaluation) {
        applyEvaluation(data.evaluation);
      }
      setCombatId(combat.id);
      setCombatName(combat.name);
      setCombatCategory(combat.category || "");
      setCombatClub(combat.club || "");
      setCombatFencers(
        typeof combat.fencers === "string"
          ? JSON.parse(combat.fencers || "[]")
          : combat.fencers || [],
      );
      setCombatDescription(combat.description || "");
      setCombatTechCode(combat.tech_code || "");
      setCategory(combat.category || "");
      setView("editor");
    } catch {
      setIndexStatus("Impossible de charger ce combat.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleEditCombat(combat) {
    setCombatId(combat.id);
    setCombatName(combat.name || "");
    setCombatCategory(combat.category || "");
    setCombatClub(combat.club || "");
    setCombatFencers(
      typeof combat.fencers === "string"
        ? JSON.parse(combat.fencers || "[]")
        : combat.fencers || []
    );
    setCombatDescription(combat.description || "");
    setCombatTechCode(combat.tech_code || "");
    setNewFencer("");
    setEditingCombatId(combat.id);
    setView("combat-create");
  }

  async function handleDeleteCombat(id) {
    if (!confirm("Supprimer ce combat ?")) return;
    setIsBusy(true);
    try {
      const res = await apiFetch(`/api/combats/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("failed");
      await loadCombats();
    } catch {
      setIndexStatus("Impossible de supprimer ce combat.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleShareCombat(id) {
    const userId = Number(shareTargets[id]);
    if (!userId) return;
    setIsBusy(true);
    try {
      const res = await apiFetch(`/api/combats/${id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("failed");
      setShareTargets((prev) => ({ ...prev, [id]: "" }));
      await loadShares(id);
    } catch {
      setIndexStatus("Impossible de partager ce combat.");
    } finally {
      setIsBusy(false);
    }
  }

  const loadShares = async (id) => {
    try {
      const res = await apiFetch(`/api/combats/${id}/shares`);
      if (!res.ok) return;
      const data = await res.json();
      setShareLists((prev) => ({
        ...prev,
        [id]: Array.isArray(data.users) ? data.users : [],
      }));
    } catch {
      // ignore
    }
  };

  const toggleShares = async (id) => {
    if (shareLists[id]) {
      setShareLists((prev) => ({ ...prev, [id]: null }));
      return;
    }
    await loadShares(id);
  };

  async function handleRevokeShare(id, userId) {
    setIsBusy(true);
    try {
      const res = await apiFetch(`/api/combats/${id}/share/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("failed");
      await loadShares(id);
    } catch {
      setIndexStatus("Impossible de retirer ce partage.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleFinishNoSave() {
    if (!confirm("Terminer sans sauvegarder ?")) return;
    resetEvaluation();
    setCombatId(null);
    setCombatName("");
    setView("index");
  }

  async function handleFinishSave() {
    if (!combatId) {
      alert("Aucun combat selectionne.");
      return;
    }
    setIsBusy(true);
    try {
      const evaluation = {
        phrases,
        penaltyCounts,
        duration,
        combatTime,
        hits,
        category,
        combatName,
      };
      const res = await apiFetch(`/api/combats/${combatId}/evaluation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: combatName.trim(), evaluation }),
      });
      if (!res.ok) throw new Error("failed");
      resetEvaluation();
      setCombatId(null);
      setCombatName("");
      setView("index");
      await loadCombats();
    } catch {
      alert("Echec sauvegarde.");
    } finally {
      setIsBusy(false);
    }
  }

  function addFencer() {
    if (!newFencer.trim()) return;
    setCombatFencers((prev) => [...prev, newFencer.trim()]);
    setNewFencer("");
  }

  function removeFencer(index) {
    setCombatFencers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreateCombatSubmit(event) {
    event.preventDefault();
    if (!combatName.trim() || !combatCategory.trim()) {
      setIndexStatus("Nom et categorie obligatoires.");
      return;
    }
    setIsBusy(true);
    try {
      const payload = {
        name: combatName.trim(),
        category: combatCategory.trim(),
        club: combatClub.trim(),
        description: combatDescription.trim(),
        fencers: combatFencers
      };
      const res = await apiFetch(
        editingCombatId ? `/api/combats/${editingCombatId}` : "/api/combats",
        {
          method: editingCombatId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error("failed");
      await loadCombats();
      setView("index");
      setEditingCombatId(null);
    } catch {
      setIndexStatus(editingCombatId ? "Impossible de modifier le combat." : "Impossible de creer le combat.");
    } finally {
      setIsBusy(false);
    }
  }

  if (!authToken) {
    return (
      <div className="page">
        <header className="header">
          <div>
            <p className="kicker">Evaluation technique</p>
            <h1>Connexion</h1>
          </div>
        </header>
        <section className="card auth-card">
          <h2>Se connecter</h2>
          <form className="form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="admin@balestra.local"
              />
            </label>
            <label>
              Mot de passe
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Votre mot de passe"
              />
            </label>
            <button type="submit" disabled={isBusy}>
              Se connecter
            </button>
          </form>
          {authError && <p className="warning">{authError}</p>}
          <p className="muted">
            Superadmin par defaut: admin@balestra.local / escrime
          </p>
        </section>
      </div>
    );
  }

  if (view === "index") {
    return (
      <div className="page">
        <header className="header">
          <div>
            <p className="kicker">Evaluation technique</p>
            <h1>Combats / spectacles</h1>
          </div>
          <div className="header-actions">
            <button
              type="button"
              onClick={handleCreateCombat}
              disabled={isBusy}
            >
              Nouveau combat
            </button>
            <button type="button" className="ghost" onClick={handleLogout}>
              Deconnexion
            </button>
          </div>
        </header>

        {indexStatus && <p className="warning">{indexStatus}</p>}

        <section className="card">
          {combats.length === 0 ? (
            <p className="muted">Aucun combat pour le moment.</p>
          ) : (
            <div className="grid-list">
              {combats.map((c) => {
                const canEdit =
                  currentUser?.role === "superadmin" ||
                  c.owner_user_id === currentUser?.id;
                return (
                  <div key={c.id} className="grid-row">
                    <div>
                      <strong>{c.name || "Sans nom"}</strong>
                      <div className="muted">
                        {c.created_at
                          ? c.created_at.slice(0, 19).replace("T", " ")
                          : ""}
                      </div>
                      {c.tech_code ? (
                        <div className="muted">Code: {c.tech_code}</div>
                      ) : null}
                      {c.is_shared ? (
                        <span className="badge badge-outline">
                          Partage avec moi
                        </span>
                      ) : null}
                    </div>
                    <div className="grid-actions">
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => handleOpenCombat(c)}
                        disabled={isBusy}
                      >
                        Noter ce combat
                      </button>
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            className="ghost"
                            onClick={() => handleEditCombat(c)}
                            disabled={isBusy}
                          >
                            Editer
                          </button>
                          <button
                            type="button"
                            className="ghost danger"
                            onClick={() => handleDeleteCombat(c.id)}
                            disabled={isBusy}
                          >
                            Supprimer
                          </button>
                          <button
                            type="button"
                            className="ghost"
                            onClick={() => toggleShares(c.id)}
                            disabled={isBusy}
                          >
                            {shareLists[c.id]
                              ? "Masquer partages"
                              : "Voir partages"}
                          </button>
                          <div className="share-row">
                            <select
                              value={shareTargets[c.id] || ""}
                              onChange={(e) =>
                                setShareTargets((prev) => ({
                                  ...prev,
                                  [c.id]: e.target.value,
                                }))
                              }
                            >
                              <option value="">Partager avec...</option>
                              {shareUsers.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.email}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="ghost"
                              onClick={() => handleShareCombat(c.id)}
                              disabled={isBusy}
                            >
                              Partager
                            </button>
                          </div>
                          {Array.isArray(shareLists[c.id]) &&
                            shareLists[c.id].length > 0 && (
                              <div className="share-list">
                                {shareLists[c.id].map((u) => (
                                  <div key={u.id} className="share-pill">
                                    <span>{u.email}</span>
                                    <button
                                      type="button"
                                      className="link"
                                      onClick={() =>
                                        handleRevokeShare(c.id, u.id)
                                      }
                                    >
                                      Retirer
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {currentUser?.role === "superadmin" && (
          <section className="card">
            <h2>Utilisateurs</h2>
            <form className="form" onSubmit={handleCreateUser}>
              <label>
                Email
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@exemple.fr"
                />
              </label>
              <label>
                Mot de passe
                <input
                  type="text"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Mot de passe provisoire"
                />
              </label>
              <button type="submit" disabled={isBusy}>
                Ajouter l'utilisateur
              </button>
            </form>
            {users.length > 0 && (
              <div className="user-list">
                {users.map((u) => (
                  <div key={u.id} className="user-row">
                    <span>{u.email}</span>
                    <div className="user-actions">
                      <span className="badge">{u.role}</span>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => handleResetUserPassword(u.id, u.email)}
                        disabled={isBusy}
                      >
                        Reinit mot de passe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    );
  }

  if (view === "combat-create") {
    return (
      <div className="page">
        <header className="header">
          <div>
            <p className="kicker">Evaluation technique</p>
            <h1>{editingCombatId ? "Modifier le combat" : "Nouveau combat"}</h1>
          </div>
          <div className="header-actions">
            <button
              className="ghost"
              type="button"
              onClick={() => setView("index")}
              disabled={isBusy}
            >
              Retour a l'index
            </button>
          </div>
        </header>

        {indexStatus && <p className="warning">{indexStatus}</p>}

        <section className="card">
          <form className="form-column" onSubmit={handleCreateCombatSubmit}>
            <div className="form-group">
              <label>
                Nom du combat
                <input
                  type="text"
                  value={combatName}
                  onChange={(e) => setCombatName(e.target.value)}
                  placeholder="Ex: La paix des ménages"
                />
              </label>
              <label>
                Categorie
                <select
                  value={combatCategory}
                  onChange={(e) => setCombatCategory(e.target.value)}
                >
                  <option value="">Selectionner</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Club d'escrime
                <input
                  type="text"
                  value={combatClub}
                  onChange={(e) => setCombatClub(e.target.value)}
                  placeholder="Ex: Cercle d'escrime"
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Description
                <textarea
                  rows="4"
                  value={combatDescription}
                  onChange={(e) => setCombatDescription(e.target.value)}
                  placeholder="Infos utiles, theme, contexte..."
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Escrimeurs
                <div className="inline-field">
                  <input
                    type="text"
                    value={newFencer}
                    onChange={(e) => setNewFencer(e.target.value)}
                    placeholder="Nom de l'escrimeur"
                  />
                  <button type="button" className="ghost" onClick={addFencer}>
                    Ajouter
                  </button>
                </div>
                {combatFencers.length > 0 && (
                  <div className="fencer-list">
                    {combatFencers.map((f, idx) => (
                      <div key={`${f}-${idx}`} className="fencer-pill">
                        <span>{f}</span>
                        <button
                          type="button"
                          className="link"
                          onClick={() => removeFencer(idx)}
                        >
                          Retirer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </label>
            </div>
            <button type="submit" disabled={isBusy}>
              {editingCombatId ? "Enregistrer les modifications" : "Creer le combat"}
            </button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="kicker">Evaluation technique</p>
          <h1 className="title-inline">
            <span>{combatName || "Sans nom"}</span>
            <span className="title-sep">-</span>
            <span>{getCategoryLabel(category) || "Type"}</span>
          </h1>
          <div className="header-meta">
            <span>
              <span className="meta-label">Duree</span>
              {duration || "--:--"}
            </span>
            <span>
              <span className="meta-label">Temps de combat</span>
              {combatTime || "--:--"}
            </span>
            <span>
              <span className="meta-label">Nombre de coups</span>
              {hits || "0"}
            </span>
            {combatTechCode && (
              <span>
                <span className="meta-label">Code</span>
                {combatTechCode}
              </span>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button
            className="ghost"
            type="button"
            onClick={() => setView("index")}
            disabled={isBusy}
          >
            Retour a l'index
          </button>
          <button
            className="ghost"
            type="button"
            onClick={() => setIsInfoOpen(true)}
          >
            Infos notation
          </button>
          <button className="ghost" type="button" onClick={handleReset}>
            Reinitialiser
          </button>
          <button type="button" onClick={handleExport}>
            Export CSV
          </button>
          <button type="button" className="ghost" onClick={handleLogout}>
            Deconnexion
          </button>
        </div>
      </header>

      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      <ContextSection
        combatName={combatName}
        category={category}
        duration={duration}
        combatTime={combatTime}
        hits={hits}
        onCombatNameChange={setCombatName}
        onCategoryChange={setCategory}
        onDurationChange={setDuration}
        onCombatTimeChange={setCombatTime}
        onHitsChange={setHits}
        categoryInfo={categoryInfo}
        timeRule={timeRule}
        durationSeconds={durationSeconds}
        combatSeconds={combatSeconds}
        perfPenaltyCount={perfPenaltyCount}
        combatPenaltyAuto={autoCombatPenalty}
        combatNameLocked
        categoryLocked
      />

      <PhraseForm
        difficulty={difficulty}
        note={note}
        onDifficultyClick={handleDifficultyClick}
        onNoteClick={handleNoteClick}
      />

      <PhraseTable
        phrases={phrases}
        onRemove={handleRemove}
        onUpdate={handleUpdatePhrase}
      />

      <Penalties
        penaltyCounts={penaltyCounts}
        setPenaltyCounts={setPenaltyCounts}
        autoCombatPenalty={autoCombatPenalty}
      />

      <Summary
        computed={computed}
        penaltyTotal={penaltyTotal}
        disqualified={disqualified}
      />

      <div className="finish-actions">
        <button
          type="button"
          className="ghost"
          onClick={handleFinishNoSave}
          disabled={isBusy}
        >
          Terminer sans sauvegarder
        </button>
        <button
          type="button"
          className="primary"
          onClick={handleFinishSave}
          disabled={isBusy}
        >
          Terminer et sauvegarder
        </button>
      </div>
    </div>
  );
}
