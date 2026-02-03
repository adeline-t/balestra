# Copilot Instructions for Balestra

## Project Overview
**Balestra** is a technical evaluation scoring application for fencing ("armes") techniques. It records multiple phrase/action evaluations at different difficulty levels, applies weighted scoring, and exports results as CSV.

**Tech Stack**: React 18 + Vite + localStorage

## Architecture & Data Flow

### Core Calculation System
The app evaluates fencing phrases with three difficulty tiers:
- **Simple**: coefficient 1.0
- **Complexe**: coefficient 1.1  
- **Avancee**: coefficient 1.2

**Scoring formula** (see `App.jsx` useMemo):
1. Calculate mean per difficulty level
2. Compute weighted average: `sum(note * coefficient) / phrase_count`
3. Convert to /10 scale: `weighted_avg * 2`
4. Apply penalties: `score_10 - penalty`

### State Management
Single component (`App.jsx`) manages:
- `phrases`: Array of `{difficulty, coef, note}` objects
- `penalty`: Numeric adjustment (subtracted from final score)
- `difficulty`, `note`: Form input state for new entries

**Persistence**: localStorage key `"balestra_evaluation_v1"` stores `{phrases, penalty}` — loads on mount, saves after any change.

### Utility Functions
- `toNumber(value, fallback)`: Safe number coercion with fallback
- `formatNumber(value, decimals)`: Decimal formatting for display (especially CSV)
- `buildCsv(phrases, penalty, computed)`: Generates RFC 4180 CSV with all metrics + summary

## Key Conventions & Patterns

### Number Handling
Always use `toNumber()` before arithmetic operations to prevent NaN propagation. Default fallback is 0.

### CSV Export Logic
The `buildCsv()` function formats detailed results:
- Per-row: index, difficulty, coefficient, raw note, weighted note
- Summary section: averages by difficulty, weighted average, /10 score, penalties, final score
- Filename: `evaluation_YYYY-MM-DD.csv` (ISO date stamp)

### Form Interaction
- Difficulty selected via button toggles (not select); current state stored in `difficulty` state
- Note rating uses button array [1–5]; UI state in `note` state
- Form submit clamps note to [0, 5] range via `Math.min/max`

### UI Components
- `.card` sections wrap distinct features (form, penalties, table, summary)
- `.header-actions` contains reset and export buttons
- `.difficulty-btn`, `.rating-btn` show active state via `active` class
- Table uses `key={`${p.difficulty}-${index}`}` for reconciliation

## Common Tasks

### Adding a New Evaluation Type
To add a 4th difficulty level (e.g., "Expert", coef 1.3):
1. Add entry to `DIFFICULTIES` array
2. No formula changes needed—`avg(list)` dynamically aggregates all types
3. Export CSV structure auto-includes new type in summary section

### Modifying Scoring
Edit the `useMemo` callback in App.jsx. Key variables:
- `avgSimple`, `avgComplexe`, `avgAvancee`: per-difficulty means
- `avgWeighted`: raw weighted mean on /5 scale
- `score10`: conversion to /10 scale (multiply by 2)

### Resetting State
`handleReset()` requires user confirmation. Clears phrases array and resets all form inputs to defaults (difficulty: "simple", note: "3", penalty: "0").

## Testing Workflows
No automated test suite. Manual verification:
- Add 3 phrases (one per difficulty) with note=5 → verify weighted average and /10 conversion
- Apply penalty → verify subtraction from final score
- Export CSV → open in spreadsheet to check number formatting and formula rows

## Development Commands
```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Production bundle to dist/
npm run preview  # Serve production bundle locally
```

## Integration Points
- **React DOM**: mounts to `#root` (index.html)
- **Vite React plugin**: enables JSX + HMR
- **No external services**: fully client-side; localStorage only persistence
