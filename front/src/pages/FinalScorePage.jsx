import React, { useMemo, useState } from "react";
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

  const effectivePenalty = (id) => {
    if (Object.prototype.hasOwnProperty.call(penaltyMap, id)) return penaltyMap[id];
    return Boolean(majorityMap[id]);
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
          {PENALTY_PRESETS.map((p) => (
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
                    onChange={(e) => onTogglePenalty(sessionTab, p.id, e.target.checked)}
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
        <button type="button" className="ghost" onClick={() => onSavePenalties(sessionTab)}>
          Enregistrer les penalites
        </button>
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
