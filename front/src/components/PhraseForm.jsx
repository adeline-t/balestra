import React from "react";
import {
  FaExclamationTriangle,
  FaHandPaper,
  FaMedkit,
  FaSignOutAlt,
} from "react-icons/fa";
import { DIFFICULTIES, PENALTY_PRESETS, toNumber } from "../data/rules.js";

const ACTION_ICON = {
  g1_mal_maitrisee: <FaHandPaper />,
  g1_sortie: <FaSignOutAlt />,
  g2_dangereuse: <FaExclamationTriangle />,
  g3_blessure: <FaMedkit />,
};

export default function PhraseForm({
  difficulty,
  note,
  onDifficultyClick,
  onNoteClick,
  pendingActionPenalties,
  onAdjustPendingActionPenalty,
}) {
  const actionPenalties = PENALTY_PRESETS.filter((p) => p.scope === "action");
  return (
    <section className="card">
      <h2>Ajouter une phrase d'arme</h2>
      <form
        className="form-inline"
        onSubmit={(event) => event.preventDefault()}
      >
        <label>
          Difficulte
          <div className="difficulty-buttons">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                type="button"
                className={
                  difficulty === d.value
                    ? "difficulty-btn active"
                    : "difficulty-btn"
                }
                onClick={() => onDifficultyClick(d.value)}
              >
                {d.label} <span>(coef {d.coef})</span>
              </button>
            ))}
          </div>
        </label>

        <label>
          Note sur 5
          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={
                  note === String(n) ? "rating-btn active" : "rating-btn"
                }
                onClick={() => onNoteClick(String(n))}
              >
                {n}
              </button>
            ))}
          </div>
        </label>

        <label>
          Penalites d'action
          <div className="action-buttons">
            {actionPenalties.map((p) => {
              const count = toNumber(pendingActionPenalties?.[p.id], 0);
              return (
                <button
                  key={p.id}
                  type="button"
                  className="icon-btn"
                  onClick={() => onAdjustPendingActionPenalty(p.id, 1)}
                  title={p.label}
                  aria-label={p.label}
                >
                  {ACTION_ICON[p.id]}
                  {count > 0 && (
                    <span className="badge badge-outline">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="link"
            onClick={() => onAdjustPendingActionPenalty("reset", 0)}
          >
            Reinitialiser
          </button>
        </label>
      </form>
    </section>
  );
}
