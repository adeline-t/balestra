import React, { useEffect, useRef, useState } from "react";
import { FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { formatNumber } from "../data/rules.js";

function InfoTip({ label, text, isOpen, onToggle }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (event) => {
      if (buttonRef.current && buttonRef.current.contains(event.target)) return;
      onToggle(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isOpen, onToggle]);

  return (
    <span className="info-wrap">
      <button
        ref={buttonRef}
        type="button"
        className="info-icon"
        aria-label={label}
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation();
          onToggle(!isOpen);
        }}
      >
        <FaInfoCircle />
      </button>
      {isOpen && <span className="info-panel">{text}</span>}
    </span>
  );
}

export default function Summary({ computed, penaltyTotal, disqualified }) {
  const [openId, setOpenId] = useState(null);
  return (
    <section className="card">
      <details className="details" open>
        <summary>Resume du calcul</summary>
        <div className="summary">
        <div>
          <span>
            Moyenne simple
            <InfoTip
              label="Moyenne des notes des phrases simple"
              text="Moyenne des notes des phrases classees en difficulte Simple."
              isOpen={openId === "simple"}
              onToggle={(next) => setOpenId(next ? "simple" : null)}
            />
          </span>
          <strong>{formatNumber(computed.avgSimple, 2)} /5</strong>
        </div>
        <div>
          <span>
            Moyenne complexe
            <InfoTip
              label="Moyenne des notes des phrases complexes"
              text="Moyenne des notes des phrases classees en difficulte Complexe."
              isOpen={openId === "complexe"}
              onToggle={(next) => setOpenId(next ? "complexe" : null)}
            />
          </span>
          <strong>{formatNumber(computed.avgComplexe, 2)} /5</strong>
        </div>
        <div>
          <span>
            Moyenne avancee
            <InfoTip
              label="Moyenne des notes des phrases avancees"
              text="Moyenne des notes des phrases classees en difficulte Avancee."
              isOpen={openId === "avancee"}
              onToggle={(next) => setOpenId(next ? "avancee" : null)}
            />
          </span>
          <strong>{formatNumber(computed.avgAvancee, 2)} /5</strong>
        </div>
        <div>
          <span>
            Moyenne ponderee
            <InfoTip
              label="Moyenne ponderee par coefficient"
              text="Moyenne des notes ponderees par coefficient de difficulte."
              isOpen={openId === "ponderee"}
              onToggle={(next) => setOpenId(next ? "ponderee" : null)}
            />
          </span>
          <strong>{formatNumber(computed.avgWeighted, 2)} /5</strong>
        </div>
        <div>
          <span>
            Note sur 10
            <InfoTip
              label="Note sur 10"
              text="Moyenne ponderee ramenee sur 10."
              isOpen={openId === "score10"}
              onToggle={(next) => setOpenId(next ? "score10" : null)}
            />
          </span>
          <strong>{formatNumber(computed.score10, 2)} /10</strong>
        </div>
        <div>
          <span>
            Penalites
            <InfoTip
              label="Penalites"
              text="Somme des penalites appliquees (apres validation)."
              isOpen={openId === "penalites"}
              onToggle={(next) => setOpenId(next ? "penalites" : null)}
            />
          </span>
          <strong>-{formatNumber(penaltyTotal, 2)}</strong>
        </div>
        <div className="final">
          <span>
            Note technique finale
            <InfoTip
              label="Note technique finale"
              text="Note sur 10 moins penalites. Disqualification si penalite DQ."
              isOpen={openId === "finale"}
              onToggle={(next) => setOpenId(next ? "finale" : null)}
            />
          </span>
          <strong>
            {disqualified ? (
              <span className="dq-note">
                <FaExclamationTriangle className="dq-warning" />
                <span>Disqualifie</span>
              </span>
            ) : (
              `${formatNumber(computed.finalScore, 2)} /10`
            )}
          </strong>
        </div>
        </div>
      </details>
    </section>
  );
}
