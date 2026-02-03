import React, { useEffect, useMemo, useState } from "react";
import InfoModal from "./components/InfoModal.jsx";
import ContextSection from "./components/ContextSection.jsx";
import PhraseForm from "./components/PhraseForm.jsx";
import PhraseTable from "./components/PhraseTable.jsx";
import Penalties from "./components/Penalties.jsx";
import Summary from "./components/Summary.jsx";
import {
  DIFFICULTIES,
  PENALTY_PRESETS,
  TIME_RULES,
  formatNumber,
  getCategoryInfo,
  getCategoryLabel,
  getModeFromCategory,
  parseMmss,
  toNumber
} from "./data/rules.js";

const STORAGE_KEY = "balestra_evaluation_v1";

function buildCsv(phrases, penaltyTotal, computed, meta, penaltyCounts, disqualified) {
  const lines = [];
  lines.push(["meta", "categorie", getCategoryLabel(meta.category || "")]);
  lines.push(["meta", "duree_mmss", meta.duration || ""]);
  lines.push(["meta", "combat_mmss", meta.combatTime || ""]);
  lines.push(["meta", "nombre_coups", meta.hits || ""]);
  lines.push(["meta", "disqualifie", disqualified ? "oui" : "non"]);
  lines.push([]);
  lines.push(["index", "difficulte", "coefficient", "note_sur_5", "note_ponderee"]);

  phrases.forEach((p, index) => {
    lines.push([index + 1, p.difficulty, p.coef, p.note, formatNumber(p.note * p.coef, 2)]);
  });

  lines.push([]);
  lines.push(["resume", "moyenne_simple", formatNumber(computed.avgSimple, 2)]);
  lines.push(["resume", "moyenne_complexe", formatNumber(computed.avgComplexe, 2)]);
  lines.push(["resume", "moyenne_avancee", formatNumber(computed.avgAvancee, 2)]);
  lines.push(["resume", "moyenne_ponderee_sur_5", formatNumber(computed.avgWeighted, 2)]);
  lines.push(["resume", "note_sur_10", formatNumber(computed.score10, 2)]);
  lines.push(["resume", "penalites", formatNumber(penaltyTotal, 2)]);
  lines.push(["resume", "note_finale", disqualified ? "DISQUALIFIE" : formatNumber(computed.finalScore, 2)]);
  lines.push([]);
  lines.push(["penalites", "type", "occurrences", "valeur", "total"]);
  PENALTY_PRESETS.forEach((p) => {
    const count = toNumber(penaltyCounts[p.id], 0);
    lines.push([
      "penalites",
      p.label,
      count,
      p.value,
      p.value === "DQ" ? "DQ" : formatNumber(count * p.value, 2)
    ]);
  });

  return lines
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export default function App() {
  const [phrases, setPhrases] = useState([]);
  const [difficulty, setDifficulty] = useState("");
  const [note, setNote] = useState("");
  const [penaltyCounts, setPenaltyCounts] = useState({});
  const [duration, setDuration] = useState("");
  const [combatTime, setCombatTime] = useState("");
  const [hits, setHits] = useState("");
  const [category, setCategory] = useState("");
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data.phrases)) setPhrases(data.phrases);
      if (data.penaltyCounts) setPenaltyCounts(data.penaltyCounts);
      if (data.duration !== undefined) setDuration(String(data.duration));
      if (data.combatTime !== undefined) setCombatTime(String(data.combatTime));
      if (data.hits !== undefined) setHits(String(data.hits));
      if (data.category !== undefined) setCategory(String(data.category));
    } catch {
      // ignore corrupted storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        phrases,
        penaltyCounts,
        duration,
        combatTime,
        hits,
        category
      })
    );
  }, [phrases, penaltyCounts, duration, combatTime, hits, category]);

  const selectedMode = useMemo(() => getModeFromCategory(category), [category]);
  const timeRule = selectedMode ? TIME_RULES[selectedMode] : null;
  const durationSeconds = useMemo(() => parseMmss(duration), [duration]);
  const combatSeconds = useMemo(() => parseMmss(combatTime), [combatTime]);
  const categoryInfo = useMemo(() => getCategoryInfo(category), [category]);

  const combatMinSeconds = useMemo(() => {
    return timeRule ? parseMmss(timeRule.combatMin) : null;
  }, [timeRule]);

  const autoCombatPenalty = useMemo(() => {
    if (!timeRule || combatSeconds === null || combatMinSeconds === null) return 0;
    return combatSeconds < combatMinSeconds - 10 ? 1 : 0;
  }, [timeRule, combatSeconds, combatMinSeconds]);

  const perfPenaltyCount = useMemo(() => {
    if (!timeRule || durationSeconds === null) return 0;
    const totalSeconds = parseMmss(timeRule.total);
    if (totalSeconds === null) return 0;
    if (durationSeconds <= totalSeconds + 30) return 0;
    const over = durationSeconds - (totalSeconds + 30);
    return 1 + Math.floor(over / 10);
  }, [timeRule, durationSeconds]);

  const effectivePenaltyCounts = useMemo(() => {
    const next = { ...penaltyCounts };
    next.g2_temps_combat = toNumber(next.g2_temps_combat, 0) + autoCombatPenalty;
    return next;
  }, [penaltyCounts, autoCombatPenalty]);

  const penaltyTotal = useMemo(() => {
    return PENALTY_PRESETS.reduce((sum, p) => {
      if (p.value === "DQ") return sum;
      const count = toNumber(effectivePenaltyCounts[p.id], 0);
      return sum + count * p.value;
    }, 0);
  }, [effectivePenaltyCounts]);

  const disqualified = useMemo(() => {
    return PENALTY_PRESETS.some(
      (p) => p.value === "DQ" && toNumber(effectivePenaltyCounts[p.id], 0) > 0
    );
  }, [effectivePenaltyCounts]);

  const computed = useMemo(() => {
    const simple = phrases.filter((p) => p.difficulty === "simple");
    const complexe = phrases.filter((p) => p.difficulty === "complexe");
    const avancee = phrases.filter((p) => p.difficulty === "avancee");

    const avg = (list) =>
      list.length === 0 ? 0 : list.reduce((sum, p) => sum + p.note, 0) / list.length;

    const avgSimple = avg(simple);
    const avgComplexe = avg(complexe);
    const avgAvancee = avg(avancee);

    const weightedSum = phrases.reduce((sum, p) => sum + p.note * p.coef, 0);
    const avgWeighted = phrases.length === 0 ? 0 : weightedSum / phrases.length;
    const score10 = avgWeighted * 2;
    const finalScore = score10 - penaltyTotal;

    return {
      avgSimple,
      avgComplexe,
      avgAvancee,
      avgWeighted,
      score10,
      finalScore
    };
  }, [phrases, penaltyTotal]);

  function addPhrase(nextDifficulty, nextNote) {
    const difficultyMeta = DIFFICULTIES.find((d) => d.value === nextDifficulty);
    const coef = difficultyMeta?.coef ?? 1;
    const noteValue = Math.min(5, Math.max(0, toNumber(nextNote, 0)));

    setPhrases((prev) => [
      ...prev,
      {
        difficulty: nextDifficulty,
        coef,
        note: noteValue
      }
    ]);

    setDifficulty("");
    setNote("");
  }

  function handleDifficultyClick(nextDifficulty) {
    if (note) {
      addPhrase(nextDifficulty, note);
    } else {
      setDifficulty(nextDifficulty);
    }
  }

  function handleNoteClick(nextNote) {
    if (difficulty) {
      addPhrase(difficulty, nextNote);
    } else {
      setNote(nextNote);
    }
  }

  function handleRemove(index) {
    setPhrases((prev) => prev.filter((_, idx) => idx !== index));
  }

  function handleReset() {
    if (!confirm("Reinitialiser toutes les phrases ?")) return;
    setPhrases([]);
    setPenaltyCounts({});
    setDuration("");
    setCombatTime("");
    setHits("");
    setCategory("");
    setDifficulty("");
    setNote("");
  }

  function handleExport() {
    const csv = buildCsv(
      phrases,
      penaltyTotal,
      computed,
      { category, duration, combatTime, hits },
      effectivePenaltyCounts,
      disqualified
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `evaluation_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="kicker">Evaluation technique</p>
          <h1>Balestra - Note par phrase</h1>
        </div>
        <div className="header-actions">
          <button className="ghost" type="button" onClick={() => setIsInfoOpen(true)}>
            Infos notation
          </button>
          <button className="ghost" type="button" onClick={handleReset}>
            Reinitialiser
          </button>
          <button type="button" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </header>

      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      <ContextSection
        category={category}
        duration={duration}
        combatTime={combatTime}
        hits={hits}
        onCategoryChange={setCategory}
        onDurationChange={setDuration}
        onCombatTimeChange={setCombatTime}
        onHitsChange={setHits}
        categoryInfo={categoryInfo}
        timeRule={timeRule}
        durationSeconds={durationSeconds}
        combatSeconds={combatSeconds}
        perfPenaltyCount={perfPenaltyCount}
        combatPenaltyAuto={autoCombatPenalty}
      />

      <PhraseForm
        difficulty={difficulty}
        note={note}
        onDifficultyClick={handleDifficultyClick}
        onNoteClick={handleNoteClick}
      />

      <PhraseTable phrases={phrases} onRemove={handleRemove} />

      <Penalties
        penaltyCounts={penaltyCounts}
        setPenaltyCounts={setPenaltyCounts}
        autoCombatPenalty={autoCombatPenalty}
      />

      <Summary computed={computed} penaltyTotal={penaltyTotal} disqualified={disqualified} />
    </div>
  );
}
