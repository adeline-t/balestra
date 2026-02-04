import React, { useState } from "react";
import {
  FaExclamationTriangle,
  FaHandPaper,
  FaInfoCircle,
  FaMedkit,
  FaSignOutAlt
} from "react-icons/fa";
import { PENALTY_PRESETS, formatNumber, toNumber } from "../data/rules.js";

const ACTION_ICON = {
  g1_mal_maitrisee: <FaHandPaper />,
  g1_sortie: <FaSignOutAlt />,
  g2_dangereuse: <FaExclamationTriangle />,
  g3_blessure: <FaMedkit />
};

export default function Penalties({
  penaltyCounts,
  setPenaltyCounts,
  autoCombatPenalty,
}) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const total = getTotal(penaltyCounts, autoCombatPenalty);
  const actionPenalties = PENALTY_PRESETS.filter((p) => p.scope === "action");

  return (
    <section className="card">
      <details className="details">
        <summary>
          Penalites
          <button
            type="button"
            className="info-icon"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsInfoOpen(true);
            }}
            aria-label="Informations penalites"
            title="Informations penalites"
          >
            <FaInfoCircle />
          </button>
        </summary>
        <div className="penalties">
          {PENALTY_PRESETS.map((p) => {
            if (p.scope === "action") return null;
            const manualCount = toNumber(penaltyCounts[p.id], 0);
            const autoCount =
              p.id === "g2_temps_combat" ? autoCombatPenalty : 0;
            const effectiveCount = manualCount + autoCount;

            if (p.value === "DQ") {
              const dqChecked = manualCount > 0;
              return (
                <div key={p.id} className="penalty-row">
                  <div>
                    <strong>{p.label}</strong>
                    <span className="muted penalty-meta">
                      {p.group} - disqualificatif
                    </span>
                  </div>
                  <div className="penalty-controls">
                    <label className="dq-toggle">
                      <input
                        type="checkbox"
                        checked={dqChecked}
                        onChange={(event) =>
                          setPenaltyCounts((prev) => ({
                            ...prev,
                            [p.id]: event.target.checked ? 1 : 0,
                          }))
                        }
                      />
                      Cocher
                    </label>
                  </div>
                </div>
              );
            }

            return (
              <div key={p.id} className="penalty-row">
                <div>
                  <strong>{p.label}</strong>
                  <span className="muted penalty-meta">
                    {p.group} - -{p.value} / occurrence
                  </span>
                </div>
                <div className="penalty-controls">
                  {autoCount > 0 && <span className="badge">auto</span>}
                  <button
                    type="button"
                    className="ghost"
                    onClick={() =>
                      setPenaltyCounts((prev) => ({
                        ...prev,
                        [p.id]: Math.max(0, toNumber(prev[p.id], 0) - 1),
                      }))
                    }
                  >
                    -
                  </button>
                  <span className="penalty-count">{effectiveCount}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPenaltyCounts((prev) => ({
                        ...prev,
                        [p.id]: toNumber(prev[p.id], 0) + 1,
                      }))
                    }
                  >
                    +
                  </button>
                  {p.scope === "action" && (
                    <div className="penalty-quick">
                      {[1, 2, 3].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className="ghost"
                          onClick={() =>
                            setPenaltyCounts((prev) => ({
                              ...prev,
                              [p.id]: toNumber(prev[p.id], 0) + n,
                            }))
                          }
                        >
                          +{n}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div className="penalty-total">
            Total penalites: <strong>-{formatNumber(total, 2)}</strong>
          </div>
        </div>
      </details>
      {isInfoOpen && (
        <div className="modal-backdrop" onClick={() => setIsInfoOpen(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Informations penalites</h2>
              <button className="link" type="button" onClick={() => setIsInfoOpen(false)}>
                Fermer
              </button>
            </div>
            <div className="modal-body">
              <h3>Icônes des penalites d'action</h3>
              <ul>
                {actionPenalties.map((p) => (
                  <li key={p.id}>
                    <span className="action-icon">{ACTION_ICON[p.id]}</span>
                    <strong>{p.label}</strong> : {p.description}
                  </li>
                ))}
              </ul>

              <h3>Signification des penalites</h3>
              <ul>
                {PENALTY_PRESETS.map((p) => (
                  <li key={p.id}>
                    <strong>{p.label}</strong>{" "}
                    {p.value === "DQ" ? "(disqualificatif)" : `(-${p.value})`} : {p.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function getTotal(penaltyCounts, autoCombatPenalty) {
  return PENALTY_PRESETS.reduce((sum, p) => {
    if (p.scope === "action") return sum;
    if (p.value === "DQ") return sum;
    const manualCount = toNumber(penaltyCounts[p.id], 0);
    const autoCount = p.id === "g2_temps_combat" ? autoCombatPenalty : 0;
    return sum + (manualCount + autoCount) * p.value;
  }, 0);
}
