# Math Learning Enhancements — Implementation Plan

> Source: [Math Learning Enhancements.md](../Math%20Learning%20Enhancements.md)
>
> Status: **Proposal — not yet implemented.** This document analyzes the enhancement suggestions,
> recommends concrete approaches grounded in the current codebase, and defines a phased delivery plan.

## 1. Current Architecture Snapshot

The relevant baseline (verified against the repo) that every enhancement must build on:

| Concern | Current state | File |
|---|---|---|
| Problem model | `Problem { id, operand1, operand2, operation, correctAnswer, userAnswer?, isCorrect?, timeSpent?, hintsUsed? }` | `src/lib/types.ts` |
| Problem generation | `generateProblem` / `generateProblems` with difficulty ranges, single horizontal presentation | `src/lib/mathUtils.ts` |
| Answer checking | `checkAnswer(problem, userAnswer)` — exact match (with float tolerance for division) | `src/lib/mathUtils.ts` |
| Hints | `getHints(problem, step)` — returns 3 text hints; `ProblemCard` reveals one per click in Guided Mode | `src/lib/mathUtils.ts`, `src/components/ProblemCard.tsx` |
| Presentation | Horizontal `operand1  op  operand2  =  ?` in `ProblemCard`, single text `PenInput` for the answer | `src/components/ProblemCard.tsx` |
| Pen/stylus | `PenInput` — text `<input>` with `touch-action: none`, focuses on pen pointer; no stroke capture, no palm rejection tuning | `src/components/PenInput.tsx` |
| Persistence | `localStorage` for `session-history`, `current-session`, and `UserProfile` (XP/streaks/badges) | `src/App.tsx`, `src/lib/scoring.ts` |
| Gamification | XP, levels, daily streaks, 12 badges, return bonus — fully implemented | `src/lib/scoring.ts`, `src/components/gamification/*` |
| i18n | `react-i18next` configured for `en, da, de, ne, new` with RTL support | `src/lib/i18n.ts`, `src/locales/*/translation.json` |
| Session modes | `guidedMode` boolean toggle; no separate untimed/timed mode split | `src/App.tsx` |

The enhancement doc proposes a much richer CPA (Concrete-Pictorial-Abstract) layer on top of this
already-solid abstract/arithmetic core.

## 2. Suggestions & Recommended Approach

### 2.1 Visual Manipulatives (CPA: Concrete → Pictorial)

| Doc section | Suggestion | Recommendation |
|---|---|---|
| 2.1 | Ten-frames & number bonds (ages 4–8) | **Do — scoped to beginner addition/subtraction.** Render a 2×5 ten-frame grid below the problem in `ProblemCard` for `beginner` difficulty only, with tap-to-place counters. Keep it optional (a settings toggle) so the existing abstract-only path is preserved. Pure SVG/CSS, no new dependency. |
| 2.2 | Interactive number lines with jump arcs | **Do — beginner subtraction and negative-number introduction.** A draggable number line is valuable but has higher interaction complexity; defer to Phase 5 and build it as a standalone `NumberLine` component reused from the ten-frame pattern. |
| 2.3 | Area/array models for × and ÷ | **Do — beginner/intermediate multiplication.** A scalable grid with a distributive-split slider is the highest-impact manipulative for times-tables. Render an `ArrayGrid` for `beginner` multiplication; division can reuse the same grid in "grouping" mode. |
| 2.4 | Fraction strips & sector visualizers | **Defer — out of current scope.** The app has no fraction operations yet (`mathUtils.ts` only handles integers). Fraction visuals should follow a `fractions` operation type being added first; recommend tracking as a separate feature. |

> Note on the doc's `src/components/manipulatives/` tree: it overlaps cleanly with the existing flat
> `src/components/` layout. Recommend creating a `src/components/manipulatives/` subfolder to keep
> these distinct from the shadcn `ui/` primitives, matching the existing `gamification/` subfolder pattern.

### 2.2 Procedural Scaffolding & Multi-Step Workflows

| Doc section | Suggestion | Recommendation |
|---|---|---|
| 3.1 | Vertical algorithm layout with carry/borrow registers | **Do — Phase 1, highest priority.** Add a presentation-mode toggle in `ProblemCard` (horizontal vs vertical) wired to a new `VerticalAlgorithm` component. Store the mode in `UserSettings` (already exists in `types.ts`) so it persists. Implement column-by-column feedback for `intermediate`/`advanced` addition/subtraction. This is the single most impactful change for place-value understanding. |
| 3.2 | Long division & multi-digit multiplication steps | **Do — Phase 3, after vertical layout lands.** The `Divide/Multiply/Subtract/Bring Down` flow requires a step-state machine; reuse the existing `getHints` infrastructure and extend it into a `hintsEngine.ts` that can drive interactive steps, not just text. |
| 3.3 | Multi-section canvas (workspace vs scratchpad) | **Do — Phase 2.** `react-resizable-panels` is already a dependency; use it to split `ProblemCard`'s region into a formal workspace and a freeform scratchpad. The scratchpad needs real ink capture (see 7.1). |

### 2.3 Diagnostic Error Analysis & Intelligent Feedback

| Doc section | Suggestion | Recommendation |
|---|---|---|
| 4.1 | "Bug library" error classification | **Do — Phase 3, critical.** Add `ErrorCategory` + `ProblemDiagnostic` to `types.ts` (the doc's proposed types fit the existing file cleanly). Implement `classifyError(problem, providedAnswer)` in a new `src/lib/diagnostics/errorPatterns.ts` as pure functions — testable with `vitest` like the existing `mathUtils.test.ts`. Wire the result into `ProblemCard`'s incorrect-feedback banner. |
| 4.2 | Tiered hint hierarchy (nudge → pictorial → walkthrough) | **Do — Phase 3.** Refactor `getHints` into `hintsEngine.ts` returning structured `{ tier, type, content }` instead of plain strings, so Tier 2 can render a manipulative and Tier 3 can drive the vertical step flow. Keep the existing 3-step reveal UX in `ProblemCard`. |

### 2.4 Memory Retention & Mastery Systems

| Doc section | Suggestion | Recommendation |
|---|---|---|
| 5.1 | "Mistake Vault" (spaced repetition) | **Do — Phase 4, critical.** Add `StoredMistake` to `types.ts` and a `src/lib/repetition/spacedRepetition.ts` module. Persist to `localStorage` (or `IndexedDB` only if vault grows large — start with `localStorage` for consistency with the rest of the app). Use a simplified Leitner model: failed → review next session; 3 correct → graduate. Add a `MistakeVaultModal` and a "Remediation Challenge" session type that draws from the vault instead of `generateProblems`. |
| 5.2 | Fluency vs accuracy mode split | **Do — Phase 4.** Convert the existing `guidedMode` boolean into a `sessionMode: 'mastery' | 'fluency'` enum (mastery = untimed, hints + manipulatives; fluency = timed sprint, no hints). `App.tsx` already has `startTime`/timer scaffolding and speed-bonus XP — reuse it for fluency mode. |

### 2.5 Relational & Algebraic Thinking

| Doc section | Suggestion | Recommendation |
|---|---|---|
| 6.1 | Variable placement / missing operands | **Do — Phase 6.** Extend `Problem` with an optional `unknownPosition: 'result' | 'operand1' | 'operand2' | 'operator'`. `generateProblem` picks the slot; `ProblemCard` renders the blank and accepts the matching input. Backward compatible — default `unknownPosition: 'result'` preserves current behavior. |
| 6.2 | Balance scale model | **Do — Phase 6.** A `BalanceScale` manipulative component (SVG tilt animation) shown for missing-operand problems. Reuse the manipulatives subfolder. |

### 2.6 Tablet-First & Stylus UX

| Doc section | Suggestion | Recommendation |
|---|---|---|
| 7.1 | Stylus gestures, palm rejection, canvas backgrounds | **Partial — Phase 2.** Palm rejection tuning and canvas background selectors (graph/grid/dotted) are low-risk and high-value for a tablet app. **Scratch-out-to-erase and full ink gesture recognition require a real `<canvas>` ink layer**, which is a meaningful new subsystem — scope it but build only the background selector + palm-rejection `pointerType` filters first. A full handwriting-recognition stroke engine is a larger bet; recommend evaluating a lightweight library vs custom before committing. |
| 7.2 | Step-by-step stroke replay for educators | **Defer until ink layer exists (Phase 5+).** Storing stroke timestamps has no value without the ink-capture subsystem from 7.1. Track as a follow-up. |

### 2.7 Story Problems & Contextual Math

| Doc section | Suggestion | Recommendation |
|---|---|---|
| 8.1 | Word problem generator with variable substitution | **Do — Phase 6.** Add a `word` problem type to `OperationType` or a separate `ProblemType` field; generate from parameterized templates with theme/noun substitution. Templates live in `src/lib/wordProblems.ts`; numbers reuse the existing difficulty ranges. |
| 8.2 | TTS via Web Speech API | **Do — Phase 6.** `window.speechSynthesis` is dependency-free and respects the active i18n locale (`src/lib/i18n.ts` already tracks `en/da/de/ne/new`). Add a "Read aloud" button in `ProblemCard` for word problems. Guard for browsers without the API. |

## 3. Type & Module Plan

Mirrors the existing layout (`lib/` for logic, `components/` for UI) and the doc's section 9:

```
src/
├── components/
│   ├── manipulatives/          # new subfolder (mirrors gamification/)
│   │   ├── TenFrame.tsx
│   │   ├── NumberLine.tsx
│   │   ├── ArrayGrid.tsx
│   │   └── BalanceScale.tsx
│   ├── workflow/
│   │   ├── VerticalAlgorithm.tsx
│   │   └── MistakeVaultModal.tsx
│   ├── canvas/
│   │   ├── CanvasGridSelector.tsx
│   │   └── StrokeReplayViewer.tsx   # Phase 5+, depends on ink layer
│   └── diagnostics/
│       ├── BugFeedbackBanner.tsx
│       └── HintAccordion.tsx
└── lib/
    ├── diagnostics/
    │   ├── errorPatterns.ts        # classifyError(problem, answer): ErrorCategory
    │   └── hintsEngine.ts          # structured tiered hints
    ├── repetition/
    │   └── spacedRepetition.ts      # Leitner queue management
    └── wordProblems.ts             # Phase 6
```

### Type extensions (add to `src/lib/types.ts`)

The doc's proposed types fit the existing file with minor alignment:

```ts
export type ErrorCategory =
  | 'borrow_reversal'
  | 'missing_carry'
  | 'operation_swap'
  | 'off_by_one'
  | 'place_value_shift'
  | 'unknown'

export type SessionMode = 'mastery' | 'fluency'
export type UnknownPosition = 'result' | 'operand1' | 'operand2' | 'operator'
export type PresentationMode = 'horizontal' | 'vertical'

export interface ProblemDiagnostic {
  expectedAnswer: number
  providedAnswer: number
  category: ErrorCategory
  remedialHintKey: string
}

export interface StoredMistake {
  problemId: string
  num1: number
  num2: number
  operation: Exclude<OperationType, 'mixed'>
  incorrectAnswers: number[]
  repetitionLevel: number
  nextReviewTimestamp: number
}

// Extend existing Problem:
//   unknownPosition?: UnknownPosition     // default 'result'
//   diagnostic?: ProblemDiagnostic
// Extend existing UserSettings:
//   presentationMode: PresentationMode     // default 'horizontal'
//   showManipulatives: boolean             // default true
// Extend existing PracticeSession:
//   sessionMode: SessionMode               // replaces guidedMode usage over time
```

## 4. Phased Delivery Roadmap

Re-ordered to front-load the two highest-impact, lowest-risk items the doc itself flagged
(vertical layout, graph paper/palm rejection) and to sequence dependencies correctly
(diagnostics must precede the Mistake Vault that consumes them; ink layer must precede replay).

| Phase | Milestone | Key files | Effort | Depends on | Status |
|---|---|---|---|---|---|
| **1** | Vertical algorithm layout + carry/borrow registers; `PresentationMode` in `UserSettings` | `VerticalAlgorithm.tsx`, `ProblemCard.tsx`, `types.ts` | 3–5d | — | ✅ In progress (PR #39) |
| **2** | Graph/grid canvas background selector + palm-rejection `pointerType` filters; scratchpad zone via `react-resizable-panels` | `CanvasGridSelector.tsx`, `PenInput.tsx`, `ProblemCard.tsx` | 3–4d | Phase 1 | ✅ In progress (PR #40) |
| **3** | Diagnostic error classification + tiered `hintsEngine` + `BugFeedbackBanner`/`HintAccordion` | `errorPatterns.ts`, `hintsEngine.ts`, `BugFeedbackBanner.tsx` | 4–6d | Phase 1 | ✅ In progress (PR #41) |
| **4** | Mistake Vault (Leitner queue in `localStorage`) + Mastery/Fluency session modes + Remediation Challenge | `spacedRepetition.ts`, `MistakeVaultModal.tsx`, `App.tsx` | 5–7d | Phase 3 | ✅ In progress (PR #42) |
| **5** | Ten-frames + number lines + array grids (beginner/intermediate); full ink-capture layer + stroke replay | `TenFrame.tsx`, `NumberLine.tsx`, `ArrayGrid.tsx`, `StrokeReplayViewer.tsx` | 6–9d | Phases 2, 4 | ✅ In progress (PR #43) |
| **6** | Algebraic balance scales + missing operands + word problems + Web Speech TTS | `BalanceScale.tsx`, `wordProblems.ts`, `ProblemCard.tsx` | 5–7d | Phases 3, 5 | ✅ In progress (PR #44) |

**Sequencing rationale:** Phase 1 unlocks column feedback that Phases 3 & 4 build on; Phase 2's
scratchpad/ink foundation is required before Phase 5's replay; diagnostics (3) must exist before
the vault (4) can classify what it stores.

## 5. Verification & Testing Strategy

- **Unit tests** for all new `lib/` modules, matching the existing `src/lib/__tests__/` pattern (`vitest`).
  Critical: `errorPatterns.classifyError`, `spacedRepetition` scheduling, `hintsEngine` tiers.
- **Component tests** with `@testing-library/react` (already a devDependency) for `VerticalAlgorithm`,
  `MistakeVaultModal`, and manipulatives.
- **Regression:** the existing `mathUtils.test.ts` and `scoring.test.ts` must stay green — new
  `Problem` fields are all optional with defaults, so `generateProblem`/`checkAnswer` stay backward compatible.
- **Type check:** `npm run build` (`tsc -b --noCheck && vite build`) and `npm run lint` before each phase ships.
- **Manual smoke:** each phase verified on a touch/stylus device path since the app is tablet-first.

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Manipulatives bloat `ProblemCard` for older learners | Gate behind `showManipulatives` setting + difficulty; default off for `advanced` |
| Ink/stroke engine is a large bet with no current dependency | Phase 5 spikes a custom `<canvas>` ink layer first; evaluate a library vs custom before full build |
| `localStorage` Mistake Vault grows unbounded | Cap vault size; migrate to `IndexedDB` only if needed (keep parity with existing storage choice) |
| TTS support varies by browser/locale | Feature-detect `speechSynthesis`; hide the button when unavailable; fall back to text-only word problems |
| Breaking the existing horizontal-only UX | All new `Problem`/`UserSettings` fields are optional with current behavior as the default |

## 7. Out of Scope (tracked separately)

- Fraction operations & fraction-strip manipulatives (§2.4) — needs a `fractions` operation type first.
- Full handwriting/stroke recognition beyond ink capture.
- Leaderboard/leaderboard-name features (already listed in `docs/features/ROADMAP.md` Phase 3).
