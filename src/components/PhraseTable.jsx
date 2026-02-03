import React from "react";
import { formatNumber } from "../data/rules.js";

export default function PhraseTable({ phrases, onRemove }) {
  return (
    <section className="card">
      <h2>Phrases enregistrees ({phrases.length})</h2>
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
                <td>{p.difficulty}</td>
                <td>{formatNumber(p.coef, 2)}</td>
                <td>{formatNumber(p.note, 2)}</td>
                <td>{formatNumber(p.note * p.coef, 2)}</td>
                <td>
                  <button className="link" type="button" onClick={() => onRemove(index)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
