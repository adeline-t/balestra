import React from "react";

const ROLE_LABELS = {
  admin: "Administrateurs",
  jury: "Jury",
  technique: "Technique"
};

export default function CompetitionFormPage({
  editing,
  isBusy,
  competitionName,
  competitionStart,
  competitionEnd,
  competitionDescription,
  competitionLink,
  users,
  roles,
  status,
  competitionId,
  selectedRole,
  selectedUserId,
  onNameChange,
  onStartChange,
  onEndChange,
  onDescriptionChange,
  onLinkChange,
  onRoleChange,
  onUserSelect,
  onAddRoleUser,
  onRemoveRoleUser,
  onSubmit,
  onBack
}) {
  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="kicker">Evaluation technique</p>
          <h1>{editing ? "Modifier la competition" : "Nouvelle competition"}</h1>
        </div>
        <div className="header-actions">
          <button className="ghost" type="button" onClick={onBack} disabled={isBusy}>
            Retour
          </button>
        </div>
      </header>

      <section className="card">
        <form className="form-column" onSubmit={onSubmit}>
          <label>
            Nom
            <input
              type="text"
              value={competitionName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Nom de la competition"
            />
          </label>
          <label>
            Date de debut
            <input
              type="date"
              value={competitionStart}
              onChange={(e) => onStartChange(e.target.value)}
            />
          </label>
          <label>
            Date de fin
            <input
              type="date"
              value={competitionEnd}
              onChange={(e) => onEndChange(e.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              rows="3"
              value={competitionDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
            />
          </label>
          <label>
            Lien
            <input
              type="url"
              value={competitionLink}
              onChange={(e) => onLinkChange(e.target.value)}
              placeholder="https://"
            />
          </label>
          <button type="submit" disabled={isBusy}>
            {editing ? "Enregistrer" : "Creer la competition"}
          </button>
          {status && <p className="muted">{status}</p>}
        </form>
      </section>

      <section className="card">
        <h2>Gestion des droits</h2>
        {!competitionId && (
          <p className="warning">
            Enregistrez la competition avant d'ajouter des utilisateurs.
          </p>
        )}
        <div className={competitionId ? "form" : "form is-disabled"}>
          <label>
            Role
            <select value={selectedRole} onChange={(e) => onRoleChange(e.target.value)}>
              <option value="admin">Administrateur</option>
              <option value="jury">Jury</option>
              <option value="technique">Technique</option>
            </select>
          </label>
          <label>
            Utilisateur
            <select value={selectedUserId} onChange={(e) => onUserSelect(e.target.value)}>
              <option value="">Selectionner</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.prenom || u.nom ? `${u.prenom || ""} ${u.nom || ""}`.trim() : u.email}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="ghost"
            onClick={onAddRoleUser}
            disabled={isBusy || !selectedUserId || !competitionId}
          >
            Ajouter
          </button>
        </div>

        {Object.keys(ROLE_LABELS).map((role) => (
          <div key={role} className="role-section">
            <h3>{ROLE_LABELS[role]}</h3>
            {roles[role]?.length ? (
              <div className="share-list">
                {roles[role].map((u) => (
                  <div key={`${role}-${u.user_id}`} className="share-pill">
                    <span>
                      {u.prenom || u.nom ? `${u.prenom || ""} ${u.nom || ""}`.trim() : u.email}
                    </span>
                    <span className="muted">{u.email}</span>
                    <button
                      type="button"
                      className="link"
                      onClick={() => onRemoveRoleUser(u.user_id, role)}
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">Aucun utilisateur.</p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
