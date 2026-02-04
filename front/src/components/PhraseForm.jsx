import React from "react";
import { DIFFICULTIES } from "../data/rules.js";

export default function PhraseForm({ difficulty, note, onDifficultyClick, onNoteClick }) {
  return (
    <section className="card">
      <h2>Ajouter une phrase d'arme</h2>
      <form className="form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Difficulte
          <div className="difficulty-buttons">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                type="button"
                className={difficulty === d.value ? "difficulty-btn active" : "difficulty-btn"}
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
                className={note === String(n) ? "rating-btn active" : "rating-btn"}
                onClick={() => onNoteClick(String(n))}
              >
                {n}
              </button>
            ))}
          </div>
        </label>
      </form>
    </section>
  );
}
