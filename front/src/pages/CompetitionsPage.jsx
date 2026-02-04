import React from "react";

export default function CompetitionsPage({
  competitions,
  isBusy,
  onCreate,
  onEdit,
  onDelete,
  onViewCombats
}) {
  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="kicker">Evaluation technique</p>
          <h1>Competitions</h1>
        </div>
        <div className="header-actions">
          <button type="button" onClick={onCreate} disabled={isBusy}>
            Nouvelle competition
          </button>
        </div>
      </header>

      <section className="card">
        <div className="info-box">
          <strong>Etapes recommandees</strong>
          <ol className="steps-list">
            <li>Creer la competition.</li>
            <li>Ajouter les utilisateurs (admin, jury, technique).</li>
            <li>Creer les combats dans la competition.</li>
          </ol>
        </div>
        {competitions.length === 0 ? (
          <p className="muted">Aucune competition pour le moment.</p>
        ) : (
          <div className="grid-list">
            {competitions.map((c) => (
              <div key={c.id} className="grid-row grid-row-compact">
                <div className="combat-main">
                  <strong>{c.name}</strong>
                  <div className="muted">
                    {c.start_date} → {c.end_date}
                  </div>
                  {c.description && <div className="muted">{c.description}</div>}
                </div>
                <div className="action-group">
                  <button type="button" className="ghost" onClick={() => onViewCombats(c)} disabled={isBusy}>
                    Voir combats
                  </button>
                  <button type="button" className="ghost" onClick={() => onEdit(c)} disabled={isBusy}>
                    Editer
                  </button>
                  <button type="button" className="ghost danger" onClick={() => onDelete(c.id)} disabled={isBusy}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
