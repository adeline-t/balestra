import React from "react";
import { CATEGORY_OPTIONS } from "../data/rules.js";

export default function CombatFormPage({
  isBusy,
  indexStatus,
  editing,
  combatName,
  combatCategory,
  combatClub,
  combatDescription,
  combatFencers,
  newFencer,
  onNameChange,
  onCategoryChange,
  onClubChange,
  onDescriptionChange,
  onNewFencerChange,
  onAddFencer,
  onRemoveFencer,
  onSubmit,
  onBack
}) {
  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="kicker">Evaluation technique</p>
          <h1>{editing ? "Modifier le combat" : "Nouveau combat"}</h1>
        </div>
        <div className="header-actions">
          <button className="ghost" type="button" onClick={onBack} disabled={isBusy}>
            Retour a l'index
          </button>
        </div>
      </header>

      {indexStatus && <p className="warning">{indexStatus}</p>}

      <section className="card">
        <form className="form-column" onSubmit={onSubmit}>
          <label>
            Nom du combat
            <input
              type="text"
              value={combatName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ex: Finale senior - Club X"
            />
          </label>
          <label>
            Categorie
            <select value={combatCategory} onChange={(e) => onCategoryChange(e.target.value)}>
              <option value="">Selectionner</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Club d'escrime
            <input
              type="text"
              value={combatClub}
              onChange={(e) => onClubChange(e.target.value)}
              placeholder="Ex: Cercle d'escrime"
            />
          </label>
          <label>
            Description
            <textarea
              rows="3"
              value={combatDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Infos utiles, theme, contexte..."
            />
          </label>
          <label>
            Escrimeurs
            <div className="inline-field">
              <input
                type="text"
                value={newFencer}
                onChange={(e) => onNewFencerChange(e.target.value)}
                placeholder="Nom de l'escrimeur"
              />
              <button type="button" className="ghost" onClick={onAddFencer}>
                Ajouter
              </button>
            </div>
            {combatFencers.length > 0 && (
              <div className="fencer-list">
                {combatFencers.map((f, idx) => (
                  <div key={`${f}-${idx}`} className="fencer-pill">
                    <span>{f}</span>
                    <button type="button" className="link" onClick={() => onRemoveFencer(idx)}>
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </label>
          <button type="submit" disabled={isBusy}>
            {editing ? "Enregistrer les modifications" : "Creer le combat"}
          </button>
        </form>
      </section>
    </div>
  );
}
