import React, { useState } from "react";

export default function AccountPage({ currentUser, onChangePassword, onChangeProfile, isBusy, status }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState(currentUser?.prenom || "");
  const [lastName, setLastName] = useState(currentUser?.nom || "");
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

  const handleProfile = async (event) => {
    event.preventDefault();
    setLocalStatus("");
    await onChangeProfile(firstName.trim(), lastName.trim());
  };

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="kicker">Mon compte</p>
          <h1>Parametres</h1>
          <div className="muted">
            {currentUser
              ? currentUser.prenom || currentUser.nom
                ? `${currentUser.prenom || ""} ${currentUser.nom || ""}`.trim()
                : currentUser.email
              : ""}
          </div>
          <div className="muted">{currentUser?.email}</div>
        </div>
      </header>

      <section className="card">
        <h2>Profil</h2>
        <form className="form" onSubmit={handleProfile}>
          <label>
            Prenom
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Prenom"
            />
          </label>
          <label>
            Nom
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nom"
            />
          </label>
          <button type="submit" disabled={isBusy}>
            Enregistrer le profil
          </button>
        </form>
      </section>

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
