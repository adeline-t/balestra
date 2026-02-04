import React from "react";
import InfoModal from "../components/InfoModal.jsx";
import ContextSection from "../components/ContextSection.jsx";
import PhraseForm from "../components/PhraseForm.jsx";
import PhraseTable from "../components/PhraseTable.jsx";
import Penalties from "../components/Penalties.jsx";
import Summary from "../components/Summary.jsx";
import { getCategoryLabel } from "../data/rules.js";

const ART_LABELS = {
  scenario: "Scenario",
  mise_en_scene: "Mise en scene",
  costumes: "Costumes et accessoires",
  performance_theatrale: "Performance theatrale",
  performance_corporelle: "Performance corporelle",
  occupation_espace: "Occupation de l'espace"
};

export default function EvaluationPage({
  combatName,
  combatTechCode,
  category,
  duration,
  combatTime,
  hits,
  onCategoryChange,
  onDurationChange,
  onCombatTimeChange,
  onHitsChange,
  categoryInfo,
  timeRule,
  durationSeconds,
  combatSeconds,
  perfPenaltyCount,
  autoCombatPenalty,
  difficulty,
  note,
  onDifficultyClick,
  onNoteClick,
  phrases,
  onRemovePhrase,
  onUpdatePhrase,
  onAdjustActionPenalty,
  disqualified,
  penaltyCounts,
  setPenaltyCounts,
  computed,
  penaltyTotal,
  isInfoOpen,
  onOpenInfo,
  onCloseInfo,
  onReset,
  onExport,
  onFinishNoSave,
  onFinishSave,
  isBusy,
  onBack,
  sessionType,
  onSessionChange,
  artisticScores,
  onArtisticChange
}) {
  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="kicker">Evaluation technique</p>
          <h1 className="title-inline">
            <span>{combatName || "Sans nom"}</span>
            <span className="title-sep">-</span>
            <span>{getCategoryLabel(category) || "Type"}</span>
          </h1>
          <div className="header-meta">
            <span>
              <span className="meta-label">Duree</span>
              {duration || "--:--"}
            </span>
            <span>
              <span className="meta-label">Temps de combat</span>
              {combatTime || "--:--"}
            </span>
            <span>
              <span className="meta-label">Nombre de coups</span>
              {hits || "0"}
            </span>
            {combatTechCode && (
              <span>
                <span className="meta-label">Code</span>
                {combatTechCode}
              </span>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button className="ghost" type="button" onClick={onBack} disabled={isBusy}>
            Retour aux combats
          </button>
          <button className="ghost" type="button" onClick={onOpenInfo}>
            Infos notation
          </button>
          <button className="ghost" type="button" onClick={onReset}>
            Reinitialiser
          </button>
          <button type="button" onClick={onExport}>
            Export CSV
          </button>
        </div>
      </header>

      <section className="card">
        <p className="muted">
          {sessionType === "technique"
            ? "Programme Technique · notation technique uniquement."
            : "Programme Libre · notation technique + artistique."}
        </p>
      </section>

      <InfoModal isOpen={isInfoOpen} onClose={onCloseInfo} />

      <ContextSection
        combatName={combatName}
        category={category}
        duration={duration}
        combatTime={combatTime}
        hits={hits}
        onCombatNameChange={() => {}}
        onCategoryChange={onCategoryChange}
        onDurationChange={onDurationChange}
        onCombatTimeChange={onCombatTimeChange}
        onHitsChange={onHitsChange}
        categoryInfo={categoryInfo}
        timeRule={timeRule}
        durationSeconds={durationSeconds}
        combatSeconds={combatSeconds}
        perfPenaltyCount={perfPenaltyCount}
        combatPenaltyAuto={autoCombatPenalty}
        combatNameLocked
        categoryLocked
      />

      <PhraseForm
        difficulty={difficulty}
        note={note}
        onDifficultyClick={onDifficultyClick}
        onNoteClick={onNoteClick}
      />

      <PhraseTable
        phrases={phrases}
        onRemove={onRemovePhrase}
        onUpdate={onUpdatePhrase}
        onAdjustActionPenalty={onAdjustActionPenalty}
        disqualified={disqualified}
      />

      {sessionType === "libre" && (
        <section className="card">
          <h2>Notes artistiques (/5)</h2>
          <div className="form">
            {Object.entries(ART_LABELS).map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={artisticScores[key]}
                  onChange={(e) => onArtisticChange(key, e.target.value)}
                />
              </label>
            ))}
          </div>
        </section>
      )}

      <Penalties
        penaltyCounts={penaltyCounts}
        setPenaltyCounts={setPenaltyCounts}
        autoCombatPenalty={autoCombatPenalty}
      />

      <Summary computed={computed} penaltyTotal={penaltyTotal} disqualified={disqualified} />

      <div className="finish-actions">
        <button type="button" className="ghost" onClick={onFinishNoSave} disabled={isBusy}>
          Terminer sans sauvegarder
        </button>
        <button type="button" className="primary" onClick={onFinishSave} disabled={isBusy}>
          Terminer et sauvegarder
        </button>
      </div>
    </div>
  );
}
