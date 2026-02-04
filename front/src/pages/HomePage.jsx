import React from "react";

export default function HomePage({ onCreateCombat, onGoCombats }) {
  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="kicker">Evaluation technique</p>
          <h1>Accueil</h1>
        </div>
        <div className="header-actions">
          <button type="button" onClick={onCreateCombat}>
            Nouveau combat
          </button>
          <button type="button" className="ghost" onClick={onGoCombats}>
            Voir les combats
          </button>
        </div>
      </header>
      <section className="card">
        <h2>Bienvenue</h2>
        <p className="muted">
          Crée un combat, partage-le aux jurés, puis chaque juré saisit sa notation. Une seule note par
          combat et par juré.
        </p>
        <div className="info-box">
          <strong>Contact</strong>
          <p>
            Pour les questions et autres remarques, écrivez à{" "}
            <a href="mailto:balestra.k3qcbu@bumpmail.io" className="link">
              balestra.k3qcbu@bumpmail.io
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
