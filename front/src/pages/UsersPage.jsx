import React from "react";

export default function UsersPage({
  users,
  newUserEmail,
  newUserFirstName,
  newUserLastName,
  newUserPassword,
  isBusy,
  onEmailChange,
  onFirstNameChange,
  onLastNameChange,
  onPasswordChange,
  onCreateUser,
  onResetPassword
}) {
  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="kicker">Evaluation technique</p>
          <h1>Utilisateurs</h1>
        </div>
      </header>
      <section className="card">
        <h2>Ajouter un utilisateur</h2>
        <form className="form" onSubmit={onCreateUser}>
          <label>
            Email
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="user@exemple.fr"
            />
          </label>
          <label>
            Prenom
            <input
              type="text"
              value={newUserFirstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder="Prenom"
            />
          </label>
          <label>
            Nom
            <input
              type="text"
              value={newUserLastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              placeholder="Nom"
            />
          </label>
          <label>
            Mot de passe
            <input
              type="text"
              value={newUserPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Mot de passe provisoire"
            />
          </label>
          <button type="submit" disabled={isBusy}>
            Ajouter l'utilisateur
          </button>
        </form>
        {users.length > 0 && (
          <div className="user-list">
            {users.map((u) => (
              <div key={u.id} className="user-row">
                <span>
                  {u.prenom || u.nom ? `${u.prenom || ""} ${u.nom || ""}`.trim() : u.email}
                </span>
                <span className="muted">{u.email}</span>
                <div className="user-actions">
                  <span className="badge">{u.role}</span>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => onResetPassword(u.id, u.email)}
                    disabled={isBusy}
                  >
                    Reinit mot de passe
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
