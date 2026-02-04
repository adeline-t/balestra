import React from "react";

export default function CombatsPage({
  combats,
  shareUsers,
  shareTargets,
  shareLists,
  combatEvaluations,
  indexStatus,
  isBusy,
  canEditCombat,
  onCreateCombat,
  onOpenCombatTechnique,
  onOpenCombatLibre,
  onOpenFinalScores,
  onOpenResults,
  onEditCombat,
  onDeleteCombat,
  onToggleShares,
  onToggleEvaluations,
  onShareChange,
  onShareCombat,
  onRevokeShare
}) {
  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="kicker">Evaluation technique</p>
          <h1>Combats / spectacles</h1>
        </div>
        <div className="header-actions">
          <button type="button" onClick={onCreateCombat} disabled={isBusy}>
            Nouveau combat
          </button>
        </div>
      </header>

      {indexStatus && <p className="warning">{indexStatus}</p>}

      <section className="card">
        {combats.length === 0 ? (
          <p className="muted">Aucun combat pour le moment.</p>
        ) : (
          <div className="combat-list">
            {combats.map((c) => {
              const canEdit = canEditCombat(c);
              return (
                <div key={c.id} className="combat-card">
                  <div className="combat-row">
                    <div className="combat-main">
                      <div className="combat-title">
                        <strong>{c.name || "Sans nom"}</strong>
                        <div className="combat-meta">
                          {c.tech_code ? (
                            <span className="badge badge-outline">Code {c.tech_code}</span>
                          ) : null}
                          {c.is_shared ? (
                            <span className="badge badge-outline">Partage avec moi</span>
                          ) : null}
                        </div>
                      </div>
                      <div className="muted">
                        {c.created_at ? c.created_at.slice(0, 19).replace("T", " ") : ""}
                      </div>
                    </div>

                    <div className="combat-primary">
                      <button
                        type="button"
                        className="primary"
                        onClick={() => onOpenCombatTechnique(c)}
                        disabled={isBusy}
                      >
                        Noter programme technique
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => onOpenCombatLibre(c)}
                        disabled={isBusy}
                      >
                        Noter programme libre
                      </button>
                    </div>
                  </div>

                  <div className="combat-row combat-row-secondary">
                    <div className="combat-links">
                      <button
                        type="button"
                        className="link"
                        onClick={() => onOpenFinalScores(c)}
                        disabled={isBusy}
                      >
                        Note finale
                      </button>
                      <button
                        type="button"
                        className="link"
                        onClick={() => onOpenResults(c)}
                        disabled={isBusy}
                      >
                        Resultats
                      </button>
                    </div>

                    <details className="action-menu">
                      <summary>Autres actions</summary>
                      <div className="action-menu-body">
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => onToggleEvaluations(c.id)}
                          disabled={isBusy}
                        >
                          {combatEvaluations[c.id] ? "Masquer notations" : "Voir notations"}
                        </button>

                        {Array.isArray(combatEvaluations[c.id]) && (
                          <div className="note-list">
                            {combatEvaluations[c.id].length === 0 ? (
                              <span className="muted">Aucune notation.</span>
                            ) : (
                              combatEvaluations[c.id].map((n) => (
                                <div key={n.id} className="note-row">
                                  <span>{n.author_email}</span>
                                  <span className="muted">
                                    {n.created_at ? n.created_at.slice(0, 19).replace("T", " ") : ""}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {canEdit && (
                          <>
                            <div className="action-divider" />
                            <button
                              type="button"
                              className="ghost"
                              onClick={() => onEditCombat(c)}
                              disabled={isBusy}
                            >
                              Editer
                            </button>
                            <button
                              type="button"
                              className="ghost danger"
                              onClick={() => onDeleteCombat(c.id)}
                              disabled={isBusy}
                            >
                              Supprimer
                            </button>
                            <button
                              type="button"
                              className="ghost"
                              onClick={() => onToggleShares(c.id)}
                              disabled={isBusy}
                            >
                              {shareLists[c.id] ? "Masquer partages" : "Voir partages"}
                            </button>
                            <div className="share-row">
                              <select
                                value={shareTargets[c.id] || ""}
                                onChange={(e) => onShareChange(c.id, e.target.value)}
                              >
                                <option value="">Partager avec...</option>
                                {shareUsers.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.email}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className="ghost"
                                onClick={() => onShareCombat(c.id)}
                                disabled={isBusy}
                              >
                                Partager
                              </button>
                            </div>
                            {Array.isArray(shareLists[c.id]) && shareLists[c.id].length > 0 && (
                              <div className="share-list">
                                {shareLists[c.id].map((u) => (
                                  <div key={u.id} className="share-pill">
                                    <span>{u.email}</span>
                                    <button
                                      type="button"
                                      className="link"
                                      onClick={() => onRevokeShare(c.id, u.id)}
                                    >
                                      Retirer
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </details>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
