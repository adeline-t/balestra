import React from "react";
import { CATEGORY_OPTIONS } from "../data/rules.js";

export default function ContextSection({
  combatName,
  category,
  duration,
  combatTime,
  hits,
  onCombatNameChange,
  onCategoryChange,
  onDurationChange,
  onCombatTimeChange,
  onHitsChange,
  categoryInfo,
  timeRule,
  durationSeconds,
  combatSeconds,
  perfPenaltyCount,
  combatPenaltyAuto,
  combatNameLocked,
  categoryLocked
}) {
  return (
    <section className="card">
      <h2>Contexte du combat</h2>
      <div className="form">
        <label>
          Nom du combat
          <input
            type="text"
            value={combatName}
            onChange={(e) => onCombatNameChange(e.target.value)}
            placeholder="Ex: Finale senior - Club X"
            readOnly={combatNameLocked}
            disabled={combatNameLocked}
          />
        </label>

        <label>
          Categorie
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            disabled={categoryLocked}
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
          Duree (mm:ss)
          <input
            type="text"
            value={duration}
            onChange={(e) => onDurationChange(e.target.value)}
            placeholder="Ex: 02:30"
          />
        </label>

        <label>
          Temps de combat effectif (mm:ss)
          <input
            type="text"
            value={combatTime}
            onChange={(e) => onCombatTimeChange(e.target.value)}
            placeholder="Ex: 01:20"
          />
        </label>

        <label>
          Nombre de coups
          <input
            type="number"
            min="0"
            step="1"
            value={hits}
            onChange={(e) => onHitsChange(e.target.value)}
            placeholder="Ex: 12"
          />
        </label>
      </div>

      {categoryInfo.length > 0 && (
        <div className="category-info">
          {categoryInfo.map((line) => (
            <p key={line} className="muted">
              {line}
            </p>
          ))}
        </div>
      )}

      {timeRule && (
        <div className="time-rules">
          <p>
            Temps programme libre recommande: <strong>{timeRule.total}</strong> · Temps de combat minimum:{" "}
            <strong>{timeRule.combatMin}</strong>
          </p>
          {duration && durationSeconds === null && (
            <p className="muted">Format attendu pour la duree: mm:ss (ex: 02:30).</p>
          )}
          {combatTime && combatSeconds === null && (
            <p className="muted">Format attendu pour le combat effectif: mm:ss (ex: 01:20).</p>
          )}
          {durationSeconds !== null && perfPenaltyCount > 0 && (
            <p className="warning">
              Depassement de {perfPenaltyCount} penalite(s) groupe 1 (temps performance au-dela de 30 sec,
              puis toutes les 10 sec).
            </p>
          )}
          {combatSeconds !== null && combatPenaltyAuto > 0 && (
            <p className="warning">
              Temps de combat insuffisant: penalite groupe 2 appliquee automatiquement.
            </p>
          )}
          <p className="muted">
            En technique, base sur le temps de combat minimum avec pauses ~5 sec entre phrases.
          </p>
        </div>
      )}
    </section>
  );
}
