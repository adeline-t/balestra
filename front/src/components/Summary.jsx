import React from "react";
import { formatNumber } from "../data/rules.js";

export default function Summary({ computed, penaltyTotal, disqualified }) {
  return (
    <section className="card">
      <details className="details" open>
        <summary>Resume du calcul</summary>
        <div className="summary">
        <div>
          <span>Moyenne simple</span>
          <strong>{formatNumber(computed.avgSimple, 2)} /5</strong>
        </div>
        <div>
          <span>Moyenne complexe</span>
          <strong>{formatNumber(computed.avgComplexe, 2)} /5</strong>
        </div>
        <div>
          <span>Moyenne avancee</span>
          <strong>{formatNumber(computed.avgAvancee, 2)} /5</strong>
        </div>
        <div>
          <span>Moyenne ponderee</span>
          <strong>{formatNumber(computed.avgWeighted, 2)} /5</strong>
        </div>
        <div>
          <span>Note sur 10</span>
          <strong>{formatNumber(computed.score10, 2)} /10</strong>
        </div>
        <div>
          <span>Penalites</span>
          <strong>-{formatNumber(penaltyTotal, 2)}</strong>
        </div>
        <div className="final">
          <span>Note technique finale</span>
          <strong>
            {disqualified ? "DISQUALIFIE" : `${formatNumber(computed.finalScore, 2)} /10`}
          </strong>
        </div>
        </div>
      </details>
    </section>
  );
}
