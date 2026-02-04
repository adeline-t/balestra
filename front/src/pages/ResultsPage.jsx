import React, { useMemo } from "react";
import { formatNumber, PENALTY_PRESETS } from "../data/rules.js";

const sessionLabel = (session) => (session === "libre" ? "Programme Libre" : "Programme Technique");

export default function ResultsPage({
  combatName,
  combatTechCode,
  evaluations,
  penalties,
  penaltyMajority,
  onBack
}) {
  const bySession = useMemo(() => {
    const grouped = { technique: [], libre: [] };
    evaluations.forEach((e) => {
      const key = e.session_type === "libre" ? "libre" : "technique";
      grouped[key].push(e);
    });
    return grouped;
  }, [evaluations]);

  const penaltyTotals = (session) => {
    const validated = penalties[session] || {};
    const fallback = penaltyMajority[session] || {};
    let total = 0;
    let dq = false;
    PENALTY_PRESETS.forEach((p) => {
      const isValidated = validated[p.id] ?? fallback[p.id];
      if (!isValidated) return;
      if (p.value === "DQ") dq = true;
      else total += p.value;
    });
    return { total, dq };
  };

  const computeSessionAverage = (session) => {
    const list = bySession[session];
    const scores = list
      .map((e) => (session === "libre" ? e.computed?.libreScore : e.computed?.score10))
      .filter((v) => typeof v === "number");
    if (scores.length === 0) return null;
    const avg = scores.reduce((sum, v) => sum + v, 0) / scores.length;
    const { total, dq } = penaltyTotals(session);
    if (dq) return "DISQUALIFIE";
    return avg - total;
  };

  const techAvg = computeSessionAverage("technique");
  const libreAvg = computeSessionAverage("libre");

  const finalAverage =
    typeof techAvg === "number" && typeof libreAvg === "number" ? (techAvg + libreAvg) / 2 : null;

  const downloadCsv = () => {
    const lines = [];
    lines.push(["combat", combatName || ""]);
    lines.push(["code", combatTechCode || ""]);
    lines.push(["note_technique", typeof techAvg === "number" ? formatNumber(techAvg, 2) : techAvg || ""]);
    lines.push(["note_libre", typeof libreAvg === "number" ? formatNumber(libreAvg, 2) : libreAvg || ""]);
    lines.push(["note_finale", typeof finalAverage === "number" ? formatNumber(finalAverage, 2) : ""]);
    lines.push([]);
    lines.push(["session", "jury", "note", "date"]);

    evaluations.forEach((e) => {
      const score = e.session_type === "libre" ? e.computed?.libreScore : e.computed?.score10;
      lines.push([
        sessionLabel(e.session_type),
        e.author_email,
        typeof score === "number" ? formatNumber(score, 2) : "",
        e.created_at ? e.created_at.slice(0, 19).replace("T", " ") : ""
      ]);
    });

    const csv = lines
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resultats_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    window.print();
  };

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="kicker">Evaluation technique</p>
          <h1>Resultats</h1>
          <div className="muted">
            {combatName || "Combat"} {combatTechCode ? `· Code ${combatTechCode}` : ""}
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="ghost" onClick={onBack}>
            Retour aux combats
          </button>
          <button type="button" onClick={downloadCsv}>
            Export CSV
          </button>
          <button type="button" className="ghost" onClick={exportPdf}>
            Export PDF
          </button>
        </div>
      </header>

      <section className="card">
        <h2>Notes finales</h2>
        <div className="summary">
          <div>
            <span>Programme Technique</span>
            <strong>
              {typeof techAvg === "number" ? `${formatNumber(techAvg, 2)} /10` : techAvg || "--"}
            </strong>
          </div>
          <div>
            <span>Programme Libre</span>
            <strong>
              {typeof libreAvg === "number" ? `${formatNumber(libreAvg, 2)} /10` : libreAvg || "--"}
            </strong>
          </div>
          <div className="final">
            <span>Moyenne des deux Programmes</span>
            <strong>{finalAverage === null ? "--" : `${formatNumber(finalAverage, 2)} /10`}</strong>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Notes par juge</h2>
        {evaluations.length === 0 ? (
          <p className="muted">Aucune note enregistree.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Session</th>
                <th>Jure</th>
                <th>Note</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((e) => {
                const score = e.session_type === "libre" ? e.computed?.libreScore : e.computed?.score10;
                return (
                  <tr key={e.id}>
                    <td>{sessionLabel(e.session_type)}</td>
                    <td>{e.author_email}</td>
                    <td>{typeof score === "number" ? formatNumber(score, 2) : ""}</td>
                    <td>{e.created_at ? e.created_at.slice(0, 19).replace("T", " ") : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
