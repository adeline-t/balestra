export const DIFFICULTIES = [
  { label: "Simple", value: "simple", coef: 1.0 },
  { label: "Complexe", value: "complexe", coef: 1.1 },
  { label: "Avancee", value: "avancee", coef: 1.2 }
];

export const PENALTY_PRESETS = [
  {
    id: "g1_mal_maitrisee",
    group: "Groupe 1",
    label: "Action mal maitrisee",
    value: 0.25,
    scope: "action",
    description:
      "Oubli, contact involontaire, fracas d'une arme au sol, pointe proche du visage."
  },
  {
    id: "g1_sortie",
    group: "Groupe 1",
    label: "Sortie de l'espace scenique",
    value: 0.25,
    scope: "action",
    description: "Sortie des deux pieds pendant une phrase d'armes."
  },
  {
    id: "g1_temps_perf",
    group: "Groupe 1",
    label: "Temps performance insuffisant/depasse",
    value: 0.25,
    scope: "global",
    description: "Une penalite au-dela de 30 sec, puis une penalite toutes les 10 sec."
  },
  {
    id: "g1_retard",
    group: "Groupe 1",
    label: "Retard modere",
    value: 0.25,
    scope: "global",
    description:
      "Une penalite au-dela de 1 min (montage/demontage) ou presentation > 2 min apres dernier appel."
  },
  {
    id: "g2_dangereuse",
    group: "Groupe 2",
    label: "Action dangereuse",
    value: 0.5,
    scope: "action",
    description:
      "Mouvement improvise, touche involontaire, projection d'une arme hors scene, pointe au visage."
  },
  {
    id: "g2_reglement",
    group: "Groupe 2",
    label: "Non respect du reglement",
    value: 0.5,
    scope: "global",
    description:
      "Armes/accessoires/decors/costumes non conformes, jeu scenique/pause excessive, reclamation invalidee, arret medical non reconnu, bienseance, publicite."
  },
  {
    id: "g2_temps_combat",
    group: "Groupe 2",
    label: "Temps de combat insuffisant",
    value: 0.5,
    scope: "global",
    description: "Au-dela de 10 sec sous la limite autorisee."
  },
  {
    id: "g2_retard",
    group: "Groupe 2",
    label: "Retard important",
    value: 0.5,
    scope: "global",
    description:
      "Une penalite au-dela de 3 min (montage/demontage) ou presentation > 5 min apres dernier appel."
  },
  {
    id: "g3_blessure",
    group: "Groupe 3",
    label: "Blessure identifiee",
    value: "DQ",
    scope: "action",
    description:
      "Competiteur ou figurant blesse par une arme, un accessoire ou un decor."
  },
  {
    id: "g3_esprit",
    group: "Groupe 3",
    label: "Faute contre l'esprit sportif",
    value: "DQ",
    scope: "global",
    description: "Triche, comportement inapproprie, outrage."
  },
  {
    id: "g3_retard",
    group: "Groupe 3",
    label: "Retard majeur",
    value: "DQ",
    scope: "global",
    description:
      "Au-dela de 8 min (montage/demontage) ou presentation > 10 min apres dernier appel."
  }
];

export const CATEGORY_OPTIONS = [
  { value: "T1_DUEL", label: "Type 1 - Duel" },
  { value: "T1_BATAILLE", label: "Type 1 - Bataille" },
  { value: "T2_DUEL", label: "Type 2 - Duel" },
  { value: "T2_BATAILLE", label: "Type 2 - Bataille" },
  { value: "T3_DUEL", label: "Type 3 - Duel" },
  { value: "T3_BATAILLE", label: "Type 3 - Bataille" },
  { value: "T123_SOLO", label: "Type 1-2-3 - Solo" },
  { value: "T123_ENSEMBLE", label: "Type 1-2-3 - Ensemble" }
];

export const TIME_RULES = {
  SOLO: { total: "2:00", combatMin: "1:00" },
  DUEL: { total: "3:00", combatMin: "1:30" },
  ENSEMBLE: { total: "2:30", combatMin: "1:15" },
  BATAILLE: { total: "4:00", combatMin: "2:00" }
};

export function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function formatNumber(value, decimals = 2) {
  return Number.isFinite(value) ? value.toFixed(decimals) : "0.00";
}

export function parseMmss(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{1,2}):([0-5]\d)$/);
  if (!match) return null;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  return minutes * 60 + seconds;
}

export function getCategoryInfo(value) {
  if (!value) return [];
  const info = [];
  if (value.startsWith("T1")) {
    info.push(
      "Type 1: armes principales lourdes et/ou lames larges (inspiration antique/medievale)."
    );
  }
  if (value.startsWith("T2")) {
    info.push(
      "Type 2: armes principales de poids moyen et/ou lames intermediaires (inspiration renaissance)."
    );
  }
  if (value.startsWith("T3")) {
    info.push(
      "Type 3: armes principales legeres et/ou lames fines (inspiration moderne)."
    );
  }
  if (value.includes("DUEL")) info.push("Duel: confrontation entre deux combattants.");
  if (value.includes("BATAILLE")) info.push("Bataille: affrontement a plusieurs.");
  if (value.includes("SOLO")) info.push("Solo: armes selon le type.");
  if (value.includes("ENSEMBLE")) info.push("Ensemble: armes selon le type.");
  return info;
}

export function getCategoryLabel(value) {
  const found = CATEGORY_OPTIONS.find((c) => c.value === value);
  return found ? found.label : value;
}

export function getModeFromCategory(value) {
  if (value.includes("SOLO")) return "SOLO";
  if (value.includes("DUEL")) return "DUEL";
  if (value.includes("ENSEMBLE")) return "ENSEMBLE";
  if (value.includes("BATAILLE")) return "BATAILLE";
  return "";
}
