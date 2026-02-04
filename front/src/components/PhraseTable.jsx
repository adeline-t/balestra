import React, { useState } from "react";
import {
  FaExclamationTriangle,
  FaHandPaper,
  FaMedkit,
  FaMinus,
  FaSignOutAlt,
  FaTrash,
} from "react-icons/fa";
import {
  DIFFICULTIES,
  PENALTY_PRESETS,
  formatNumber,
  toNumber,
} from "../data/rules.js";

const ACTION_PENALTIES = PENALTY_PRESETS.filter((p) => p.scope === "action");

const ACTION_ICON = {
  g1_mal_maitrisee: <FaHandPaper />,
  g1_sortie: <FaSignOutAlt />,
  g2_dangereuse: <FaExclamationTriangle />,
  g3_blessure: <FaMedkit />,
};

export default function PhraseTable({
  phrases,
  onRemove,
  onUpdate,
  onAdjustActionPenalty = () => {},
  disqualified = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const difficultyLabel = (value) => {
    const hit = DIFFICULTIES.find((d) => d.value === value);
    return hit ? hit.label : value;
  };

  return (
    <section className="card">
      <div className="card-title">
        <h2>Phrases enregistrees ({phrases.length})</h2>
        <button
          type="button"
          className={isEditing ? "ghost" : ""}
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? "Quitter l'edition" : "Mode edition"}
        </button>
      </div>
      {phrases.length === 0 ? (
        <p className="muted">Aucune phrase saisie pour le moment.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Difficulte</th>
              <th>Coef</th>
              <th>Note /5</th>
              <th>Note ponderee</th>
              {ACTION_PENALTIES.map((penalty) => (
                <th
                  key={penalty.id}
                  title={penalty.label}
                  aria-label={penalty.label}
                >
                  {ACTION_ICON[penalty.id]}
                </th>
              ))}
              <th>Total penalite</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {phrases.map((p, index) => {
              const actionTotal = ACTION_PENALTIES.reduce(
                (sum, penalty) =>
                  sum +
                  toNumber(p.actionPenalties?.[penalty.id], 0) *
                    toNumber(penalty.value, 0),
                0,
              );
              return (
                <tr key={`${p.difficulty}-${index}`}>
                  <td className="phrase-index-cell">
                    <div className="phrase-index">
                      {disqualified && (
                        <FaExclamationTriangle
                          className="dq-warning"
                          title="Disqualifie"
                        />
                      )}
                      <span>{index + 1}</span>
                    </div>
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        value={p.difficulty}
                        onChange={(event) =>
                          onUpdate(index, event.target.value, p.note)
                        }
                      >
                        {DIFFICULTIES.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      difficultyLabel(p.difficulty)
                    )}
                  </td>
                  <td>{formatNumber(p.coef, 2)}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={p.note}
                        onChange={(event) =>
                          onUpdate(index, p.difficulty, event.target.value)
                        }
                      />
                    ) : (
                      formatNumber(p.note, 2)
                    )}
                  </td>
                  <td>{formatNumber(p.note * p.coef, 2)}</td>
                  {ACTION_PENALTIES.map((penalty) => {
                    const count = toNumber(p.actionPenalties?.[penalty.id], 0);
                    return (
                      <td key={penalty.id}>
                        <div className="action-cell-inline">
                          <span>{count}</span>
                          {isEditing && (
                            <button
                              type="button"
                              className="icon-btn small"
                              onClick={() =>
                                onAdjustActionPenalty(index, penalty.id, -1)
                              }
                              disabled={count === 0}
                              aria-label={`Retirer ${penalty.label}`}
                              title={`Retirer ${penalty.label}`}
                            >
                              <FaMinus />
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td>{formatNumber(actionTotal, 2)}</td>
                  <td>
                    <div className="table-actions action-cell">
                      <div className="action-buttons">
                        {ACTION_PENALTIES.map((penalty) => (
                          <button
                            key={penalty.id}
                            type="button"
                            className="icon-btn"
                            onClick={() =>
                              onAdjustActionPenalty(index, penalty.id, 1)
                            }
                            aria-label={`Ajouter ${penalty.label}`}
                            title={`Ajouter ${penalty.label}`}
                          >
                            {ACTION_ICON[penalty.id]}
                          </button>
                        ))}
                        <button
                          className="icon-btn danger"
                          type="button"
                          onClick={() => onRemove(index)}
                          aria-label="Supprimer la phrase"
                          title="Supprimer la phrase"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
