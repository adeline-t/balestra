import React from "react";
import { PENALTY_PRESETS, formatNumber, toNumber } from "../data/rules.js";

export default function Penalties({
  penaltyCounts,
  setPenaltyCounts,
  autoCombatPenalty,
}) {
  const total = getTotal(penaltyCounts, autoCombatPenalty);

  return (
    <section className="card">
      <details className="details">
        <summary>Penalites</summary>
        <div className="penalties">
          {PENALTY_PRESETS.map((p) => {
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
                </div>
              </div>
            );
          })}
          <div className="penalty-total">
            Total penalites: <strong>-{formatNumber(total, 2)}</strong>
          </div>
        </div>
      </details>
    </section>
  );
}

function getTotal(penaltyCounts, autoCombatPenalty) {
  return PENALTY_PRESETS.reduce((sum, p) => {
    if (p.value === "DQ") return sum;
    const manualCount = toNumber(penaltyCounts[p.id], 0);
    const autoCount = p.id === "g2_temps_combat" ? autoCombatPenalty : 0;
    return sum + (manualCount + autoCount) * p.value;
  }, 0);
}
