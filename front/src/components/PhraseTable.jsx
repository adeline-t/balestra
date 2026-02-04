import React, { useState } from "react";
import { DIFFICULTIES, formatNumber } from "../data/rules.js";

export default function PhraseTable({ phrases, onRemove, onUpdate }) {
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {phrases.map((p, index) => (
              <tr key={`${p.difficulty}-${index}`}>
                <td>{index + 1}</td>
                <td>
                  {isEditing ? (
                    <select
                      value={p.difficulty}
                      onChange={(event) => onUpdate(index, event.target.value, p.note)}
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
                      onChange={(event) => onUpdate(index, p.difficulty, event.target.value)}
                    />
                  ) : (
                    formatNumber(p.note, 2)
                  )}
                </td>
                <td>{formatNumber(p.note * p.coef, 2)}</td>
                <td>
                  <div className="table-actions">
                    <button className="link" type="button" onClick={() => onRemove(index)}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
