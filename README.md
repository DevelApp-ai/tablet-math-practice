# Tablet Math Practice

A printable math practice application designed for tablet pen input. It provides
adaptive learning across multiple difficulty levels with built-in guidance,
feedback, gamification, a Mistake Vault for spaced repetition, visual
manipulatives, and worksheet export.

Built with React, Vite, TypeScript, Tailwind CSS, Radix UI, and Phosphor icons.

## Features

- Beginner / intermediate / advanced difficulty levels
- Addition, subtraction, multiplication, division, and mixed practice
- Tablet pen input with real-time validation
- Horizontal and vertical (algorithm) presentation modes
- Diagnostic error classification with tiered hints
- Mistake Vault with spaced-repetition remediation sessions
- Mastery (untimed, hints) and Fluency (timed sprint) session modes
- Gamification: XP, levels, streaks, and badges
- Visual manipulatives (ten-frames, number lines, array grids, balance scales)
- Word problems with read-aloud (Web Speech TTS)
- Ink-capture scratchpad with educator stroke replay
- Printable worksheet generation
- i18n: English, Danish, German, Nepali, Newari

## Development

```bash
npm install      # install dependencies
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm test         # run the test suite
```

The app builds as a static site and is deployed to GitHub Pages from the `main`
branch via the included workflow.

See [PRD.md](./PRD.md) for the full product specification.

## License

MIT
