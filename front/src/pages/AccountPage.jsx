import React, { useState } from "react";

export default function AccountPage({ currentUser, onChangePassword, isBusy, status }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localStatus, setLocalStatus] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalStatus("");
    if (!password.trim()) {
      setLocalStatus("Le mot de passe est requis.");
      return;
    }
    if (password !== confirm) {
      setLocalStatus("La confirmation ne correspond pas.");
      return;
    }
    await onChangePassword(password.trim());
    setPassword("");
    setConfirm("");
  };

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="kicker">Mon compte</p>
          <h1>Parametres</h1>
          <div className="muted">{currentUser?.email}</div>
        </div>
      </header>

      <section className="card">
        <h2>Changer le mot de passe</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Nouveau mot de passe
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirmer le mot de passe
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" disabled={isBusy}>
            Mettre a jour
          </button>
          {(localStatus || status) && <p className="muted">{localStatus || status}</p>}
        </form>
      </section>
    </div>
  );
}
