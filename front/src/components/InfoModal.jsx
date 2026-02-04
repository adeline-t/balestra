import React from "react";
import { PENALTY_PRESETS } from "../data/rules.js";

export default function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Informations notation</h2>
          <button className="link" type="button" onClick={onClose}>
            Fermer
          </button>
        </div>
        <div className="modal-body">
          <h3>Difficultes</h3>
          <ul>
            <li>
              <strong>Simple (coef 1)</strong> : phrase lisible, rythme stable,
              enchainements basiques.
            </li>
            <li>
              <strong>Complexe (coef 1,1)</strong> : changements de rythme,
              coordination plus exigeante.
            </li>
            <li>
              <strong>Avancee (coef 1,2)</strong> : combinaisons difficiles,
              timing fin, execution technique elevee.
            </li>
          </ul>

          <h3>Notes sur 5</h3>
          <ul>
            <li>
              <strong>1-2 (acceptable)</strong> : actions peu vraisemblables,
              fluidite faible, logique de l'arme peu respectee.
            </li>
            <li>
              <strong>3-4 (correcte)</strong> : execution globalement juste,
              erreurs ponctuelles de timing, technique ou posture.
            </li>
            <li>
              <strong>5 (excellente)</strong> : actions vraisemblables,
              fluidite maitrisee, gestes precis et securite constante.
            </li>
          </ul>

          <h3>Criteres</h3>
          <ul>
            <li>
              <strong>Lecture de la phrase d'armes</strong> : vraisemblance,
              logique de l'arme, timing, fluidite.
            </li>
            <li>
              <strong>Securite</strong> : controle des actions, gestion de la
              distance, equilibre.
            </li>
            <li>
              <strong>Realisation</strong> : coordination, posture, qualite des
              gestes.
            </li>
          </ul>

          <h3>Penalites</h3>
          <ul>
            {PENALTY_PRESETS.map((p) => (
              <li key={p.id}>
                <strong>{p.label}</strong> {p.value === "DQ" ? "(disqualificatif)" : `(-${p.value})`} : {p.description}
              </li>
            ))}
          </ul>

          <h3>Rappels temps</h3>
          <ul>
            <li>
              <strong>Programme libre</strong> : Solo 2:00, Duel 3:00, Ensemble
              2:30, Bataille 4:00.
            </li>
            <li>
              <strong>Temps de combat minimum</strong> : Solo 1:00, Duel 1:30,
              Ensemble 1:15, Bataille 2:00.
            </li>
            <li>
              <strong>Programme technique</strong> : base sur le temps de combat
              minimum, avec pauses d'environ 5 sec entre phrases. Pauses trop
              longues = penalite "non respect du reglement".
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
