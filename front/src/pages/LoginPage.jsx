import React from "react";

export default function LoginPage({
  authEmail,
  authPassword,
  authError,
  isBusy,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) {
  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="kicker">Evaluation technique</p>
          <h1>Connexion</h1>
        </div>
      </header>
      <section className="card auth-card">
        <h2>Se connecter</h2>
        <form className="form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              value={authEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="admin@balestra.local"
            />
          </label>
          <label>
            Mot de passe
            <input
              type="password"
              value={authPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Votre mot de passe"
            />
          </label>
          <button type="submit" disabled={isBusy}>
            Se connecter
          </button>
        </form>
        {authError && <p className="warning">{authError}</p>}
        <div className="info-box">
          <strong>Inscription</strong>
          <p>
            Envoyez un email a{" "}
            <a href="mailto:balestra.k3qcbu@bumpmail.io" className="link">
              balestra.k3qcbu@bumpmail.io
            </a>{" "}
            en indiquant l'adresse email a utiliser.
          </p>
        </div>
      </section>
    </div>
  );
}
