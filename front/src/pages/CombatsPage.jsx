import React, { useState } from "react";
import { FaClipboardList, FaShareAlt, FaTrophy, FaEdit, FaTrashAlt } from "react-icons/fa";

export default function CombatsPage({
  combats,
  shareUsers,
  shareTargets,
  shareLists,
  combatEvaluations,
  myEvaluationsMap,
  currentUser,
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
  onLoadShares,
  onToggleEvaluations,
  onShareChange,
  onShareCombat,
  onRevokeShare,
}) {
  const [shareModalId, setShareModalId] = useState(null);
  const openShareModal = async (id) => {
    setShareModalId(id);
    await onLoadShares(id);
  };
  const closeShareModal = () => setShareModalId(null);

  const activeShareCombat = combats.find(
    (c) => String(c.id) === String(shareModalId),
  );
  const activeShareList = shareModalId ? shareLists[shareModalId] : null;
  const isOwner =
    activeShareCombat &&
    currentUser &&
    activeShareCombat.owner_user_id === currentUser.id;
  const ownerLabel = activeShareCombat
    ? isOwner
      ? "Vous"
      : activeShareCombat.owner_email || "—"
    : "—";
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
              const myMap = myEvaluationsMap?.[String(c.id)];
              const techDone = myMap?.technique;
              const libreDone = myMap?.libre;
              return (
                <div key={c.id} className="combat-card">
                  <div className="combat-row combat-header">
                    <div className="combat-main">
                      <div className="combat-title">
                        <strong>{c.name || "Sans nom"}</strong>
                        <div className="combat-meta">
                          {c.tech_code ? (
                            <span className="badge badge-outline">
                              Code {c.tech_code}
                            </span>
                          ) : null}
                          {c.is_shared ? (
                            <span className="badge badge-outline">
                              Partage avec moi
                            </span>
                          ) : null}
                          {currentUser && c.owner_user_id === currentUser.id ? (
                            <span className="badge badge-outline">
                              Proprietaire
                            </span>
                          ) : (
                            c.owner_email && (
                              <span className="badge badge-outline">
                                Detenteur : {c.owner_email}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                      <div className="combat-subline">
                        <span className="muted">
                          Catégorie : {c.category || "—"}
                        </span>
                      </div>
                      <div className="combat-subline">
                        <span className="muted">Club : {c.club || "—"}</span>
                      </div>
                      <div className="muted">
                        Date :{" "}
                        {c.created_at
                          ? c.created_at.slice(0, 19).replace("T", " ")
                          : ""}
                      </div>
                    </div>
                    <div className="combat-actions-right">
                      <button
                        type="button"
                        className="primary"
                        onClick={() => onOpenCombatTechnique(c)}
                        disabled={isBusy || techDone}
                      >
                        {techDone ? "Deja note" : "Noter programme technique"}
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => onOpenCombatLibre(c)}
                        disabled={isBusy || libreDone}
                      >
                        {libreDone ? "Deja note" : "Noter programme libre"}
                      </button>
                      {canEdit && (
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label="Partager ce combat"
                          title="Partager ce combat"
                          onClick={() => openShareModal(c.id)}
                          disabled={isBusy}
                        >
                          <FaShareAlt />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="combat-row combat-row-secondary">
                    <div className="combat-links">
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => onOpenFinalScores(c)}
                        disabled={isBusy}
                      >
                        <FaClipboardList />
                        Note finale
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => onOpenResults(c)}
                        disabled={isBusy}
                      >
                        <FaTrophy />
                        Resultats
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => onToggleEvaluations(c.id)}
                        disabled={isBusy}
                      >
                        <FaClipboardList />
                        {combatEvaluations[c.id]
                          ? "Masquer notations"
                          : "Voir notations"}
                      </button>
                    </div>
                  </div>

                  {Array.isArray(combatEvaluations[c.id]) && (
                    <div className="note-list">
                      {combatEvaluations[c.id].length === 0 ? (
                        <span className="muted">Aucune notation.</span>
                      ) : (
                        combatEvaluations[c.id].map((n) => (
                          <div key={n.id} className="note-row">
                            <span>{n.author_email}</span>
                            <span className="muted">
                              {n.created_at
                                ? n.created_at.slice(0, 19).replace("T", " ")
                                : ""}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {canEdit && (
                    <details className="action-menu">
                      <summary>Actions admin</summary>
                      <div className="action-menu-body">
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => onEditCombat(c)}
                          disabled={isBusy}
                        >
                          <FaEdit />
                          Editer
                        </button>
                        <button
                          type="button"
                          className="ghost danger"
                          onClick={() => onDeleteCombat(c.id)}
                          disabled={isBusy}
                        >
                          <FaTrashAlt />
                          Supprimer
                        </button>
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => openShareModal(c.id)}
                          disabled={isBusy}
                        >
                          <FaShareAlt />
                          Gerer les partages
                        </button>
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {shareModalId && (
        <div className="modal-backdrop" onClick={closeShareModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Partager le combat</h2>
              <button className="link" type="button" onClick={closeShareModal}>
                Fermer
              </button>
            </div>
            <div className="modal-body">
              <p className="muted share-owner">
                <strong>Detenteur :</strong> {ownerLabel}{" "}
                {isOwner && (
                  <span className="badge badge-outline">Proprietaire</span>
                )}
              </p>
              <h3>Deja ajoute</h3>
              {Array.isArray(activeShareList) ? (
                activeShareList.length === 0 ? (
                  <p className="muted">Aucun partage pour le moment.</p>
                ) : (
                  <div className="share-list">
                    {activeShareList.map((u) => (
                      <div key={u.id} className="share-pill">
                        <span>{u.email}</span>
                        <button
                          type="button"
                          className="link"
                          onClick={() => onRevokeShare(shareModalId, u.id)}
                        >
                          Retirer
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <p className="muted">Chargement des partages...</p>
              )}

              <h3>Ajouter un partage</h3>
              <div className="share-row">
                <select
                  value={shareTargets[shareModalId] || ""}
                  onChange={(e) => onShareChange(shareModalId, e.target.value)}
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
                  onClick={() => onShareCombat(shareModalId)}
                  disabled={isBusy}
                >
                  Partager
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
