import React, { useEffect, useMemo, useState } from "react";
import { formatNumber, PENALTY_PRESETS } from "../data/rules.js";

const ART_KEYS = [
  "scenario",
  "mise_en_scene",
  "costumes",
  "performance_theatrale",
  "performance_corporelle",
  "occupation_espace"
];

const ART_LABELS = {
  scenario: "Scenario",
  mise_en_scene: "Mise en scene",
  costumes: "Costumes et accessoires",
  performance_theatrale: "Performance theatrale",
  performance_corporelle: "Performance corporelle",
  occupation_espace: "Occupation de l'espace"
};

const sessionLabel = (session) => (session === "libre" ? "Programme Libre" : "Programme Technique");

export default function FinalScorePage({
  combatName,
  combatTechCode,
  evaluations,
  penalties,
  penaltyMajority,
  onTogglePenalty,
  onSavePenalties,
  onBack
}) {
  const [sessionTab, setSessionTab] = useState("technique");
  const [baseline, setBaseline] = useState("{}");
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const bySession = useMemo(() => {
    const grouped = { technique: [], libre: [] };
    evaluations.forEach((e) => {
      const key = e.session_type === "libre" ? "libre" : "technique";
      grouped[key].push(e);
    });
    return grouped;
  }, [evaluations]);

  const scores = bySession[sessionTab].filter((e) => {
    const val = sessionTab === "libre" ? e.computed?.libreScore : e.computed?.score10;
    return typeof val === "number";
  });
  const average = scores.length
    ? scores.reduce((sum, e) => {
        const val = sessionTab === "libre" ? e.computed.libreScore : e.computed.score10;
        return sum + val;
      }, 0) / scores.length
    : null;

  const penaltyMap = penalties[sessionTab] || {};
  const majorityMap = penaltyMajority[sessionTab] || {};
  const globalPenalties = useMemo(
    () => PENALTY_PRESETS.filter((p) => p.scope !== "action"),
    []
  );
  const hasChanges = useMemo(
    () => baseline !== JSON.stringify(penaltyMap || {}),
    [baseline, penaltyMap]
  );

  useEffect(() => {
    setDirty(false);
    setSaveStatus("");
    setBaseline(JSON.stringify(penaltyMap || {}));
  }, [sessionTab]);

  useEffect(() => {
    if (!dirty) {
      setBaseline(JSON.stringify(penaltyMap || {}));
    }
  }, [penaltyMap, dirty]);

  const effectivePenalty = (id) => {
    if (Object.prototype.hasOwnProperty.call(penaltyMap, id)) return penaltyMap[id];
    return Boolean(majorityMap[id]);
  };

  const actionPenaltyRows = useMemo(() => {
    const rows = new Map();
    const evaluationsForSession = bySession[sessionTab] || [];
    const totalJudges = evaluationsForSession.length;
    evaluationsForSession.forEach((e) => {
      const phrases = e.evaluation?.phrases;
      if (!Array.isArray(phrases)) return;
      const seen = new Set();
      phrases.forEach((phrase, idx) => {
        const penalties = phrase?.actionPenalties || {};
        Object.entries(penalties).forEach(([penaltyId, count]) => {
          if (!count) return;
          const key = `${idx + 1}:${penaltyId}`;
          if (seen.has(key)) return;
          seen.add(key);
          const current = rows.get(key) || {
            actionNumber: idx + 1,
            penaltyId,
            judgeCount: 0,
            totalJudges
          };
          current.judgeCount += 1;
          rows.set(key, current);
        });
      });
    });

    return Array.from(rows.values())
      .map((row) => {
        const penaltyMeta = PENALTY_PRESETS.find((p) => p.id === row.penaltyId);
        return {
          ...row,
          key: `action:${row.actionNumber}:${row.penaltyId}`,
          label: penaltyMeta?.label || row.penaltyId,
          group: penaltyMeta?.group || "",
          majority:
            row.totalJudges > 0 ? row.judgeCount / row.totalJudges >= 0.5 : false
        };
      })
      .sort((a, b) => a.actionNumber - b.actionNumber);
  }, [bySession, sessionTab]);

  const effectiveActionPenalty = (key, majority) => {
    if (Object.prototype.hasOwnProperty.call(penaltyMap, key)) return penaltyMap[key];
    return Boolean(majority);
  };

  const buildEffectiveMap = () => {
    const next = {};
    globalPenalties.forEach((p) => {
      if (Object.prototype.hasOwnProperty.call(penaltyMap, p.id)) {
        next[p.id] = penaltyMap[p.id];
      } else {
        next[p.id] = Boolean(majorityMap[p.id]);
      }
    });
    actionPenaltyRows.forEach((row) => {
      if (Object.prototype.hasOwnProperty.call(penaltyMap, row.key)) {
        next[row.key] = penaltyMap[row.key];
      } else {
        next[row.key] = Boolean(row.majority);
      }
    });
    return next;
  };

  const handleSave = async () => {
    setSaveStatus("");
    const ok = await onSavePenalties(sessionTab, buildEffectiveMap());
    if (ok) {
      setBaseline(JSON.stringify(penaltyMap || {}));
      setDirty(false);
      setSaveStatus("Penalites enregistrees.");
    } else {
      setSaveStatus("Echec de l'enregistrement.");
    }
  };

  const overallAverage = useMemo(() => {
    const techScores = bySession.technique
      .filter((e) => e.computed && typeof e.computed.score10 === "number")
      .map((e) => e.computed.score10);
    const libreScores = bySession.libre
      .filter((e) => e.computed && typeof e.computed.libreScore === "number")
      .map((e) => e.computed.libreScore);

    if (techScores.length === 0 || libreScores.length === 0) return null;
    const techAvg = techScores.reduce((a, b) => a + b, 0) / techScores.length;
    const libreAvg = libreScores.reduce((a, b) => a + b, 0) / libreScores.length;
    return (techAvg + libreAvg) / 2;
  }, [bySession]);

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="kicker">Evaluation technique</p>
          <h1>Note finale</h1>
          <div className="muted">
            {combatName || "Combat"} {combatTechCode ? `· Code ${combatTechCode}` : ""}
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="ghost" onClick={onBack}>
            Retour aux combats
          </button>
        </div>
      </header>

      <section className="card">
        <h2>Classement general</h2>
        {overallAverage === null ? (
          <p className="muted">Impossible de calculer la moyenne (il manque une session).</p>
        ) : (
          <div className="summary">
            <div className="final">
              <span>Moyenne des deux programmes</span>
              <strong>{formatNumber(overallAverage, 2)} /10</strong>
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <div className="tabs">
          <button
            type="button"
            className={sessionTab === "technique" ? "tab-btn active" : "tab-btn"}
            onClick={() => setSessionTab("technique")}
          >
            Programme Technique
          </button>
          <button
            type="button"
            className={sessionTab === "libre" ? "tab-btn active" : "tab-btn"}
            onClick={() => setSessionTab("libre")}
          >
            Programme Libre
          </button>
        </div>

        <div className="summary">
          <div>
            <span>Nombre de jurés</span>
            <strong>{scores.length}</strong>
          </div>
          <div>
            <span>Moyenne session (brut)</span>
            <strong>{average === null ? "--" : `${formatNumber(average, 2)} /10`}</strong>
          </div>
        </div>

        <h2 className="section-title">Notes par juré</h2>
        {scores.length === 0 ? (
          <p className="muted">Aucune note enregistree.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Juré</th>
                <th>Note finale</th>
                {sessionTab === "libre" && <th>Note artistique</th>}
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s) => (
                <tr key={s.id}>
                  <td>{s.author_email}</td>
                  <td>
                    {formatNumber(
                      sessionTab === "libre" ? s.computed.libreScore : s.computed.score10,
                      2
                    )}{" "}
                    /10
                  </td>
                  {sessionTab === "libre" && (
                    <td>
                      {s.computed.artisticAverage === null
                        ? "--"
                        : `${formatNumber(s.computed.artisticAverage, 2)} /5`}
                    </td>
                  )}
                  <td>{s.created_at ? s.created_at.slice(0, 19).replace("T", " ") : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <h2>Validation des penalites ({sessionLabel(sessionTab)})</h2>
        <div className="penalties">
          {globalPenalties.map((p) => (
            <div key={p.id} className="penalty-row">
              <div>
                <strong>{p.label}</strong>
                <span className="muted penalty-meta">{p.group}</span>
              </div>
              <div className="penalty-controls">
                <label className="dq-toggle">
                  <input
                    type="checkbox"
                    checked={effectivePenalty(p.id)}
                    onChange={(e) => handleToggle(p.id, e.target.checked)}
                  />
                  Valider
                </label>
                {!Object.prototype.hasOwnProperty.call(penaltyMap, p.id) && majorityMap[p.id] && (
                  <span className="badge">majorite</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <h3 className="section-title">Penalites d'action</h3>
        {actionPenaltyRows.length === 0 ? (
          <p className="muted">Aucune penalite d'action signalee.</p>
        ) : (
          <div className="penalties">
            {actionPenaltyRows.map((row) => (
              <div key={row.key} className="penalty-row">
                <div>
                  <strong>
                    Action {row.actionNumber} · {row.label}
                  </strong>
                  {row.group && <span className="muted penalty-meta">{row.group}</span>}
                  <span className="muted penalty-meta">
                    {row.judgeCount}/{row.totalJudges} jurés
                  </span>
                </div>
                <div className="penalty-controls">
                  <label className="dq-toggle">
                    <input
                      type="checkbox"
                      checked={effectiveActionPenalty(row.key, row.majority)}
                      onChange={(e) => handleToggle(row.key, e.target.checked)}
                    />
                    Valider
                  </label>
                  {!Object.prototype.hasOwnProperty.call(penaltyMap, row.key) && row.majority && (
                    <span className="badge">majorite</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          className="ghost penalty-save"
          onClick={handleSave}
          disabled={!hasChanges}
        >
          Enregistrer les penalites
        </button>
        {saveStatus && <p className="muted">{saveStatus}</p>}
      </section>

      {sessionTab === "libre" && (
        <section className="card">
          <h2>Rappel criteres artistiques</h2>
          <div className="summary">
            {ART_KEYS.map((k) => (
              <div key={k}>
                <span>{ART_LABELS[k]}</span>
                <strong>/5</strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
  const handleToggle = (penaltyId, checked) => {
    setDirty(true);
    onTogglePenalty(sessionTab, penaltyId, checked);
  };
