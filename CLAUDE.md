# Receitas da Quinzena

Portuguese recipe swipe app for two people (Diogo & Sara). Tinder-style swiping, two-device matching via Supabase, fortnightly meal planning with shopping list generation.

## Stack
- React + Vite (single-file component: `src/App.jsx`)
- Supabase backend (URL + anon key already in App.jsx)
- PWA via vite-plugin-pwa
- Deployed on Netlify (GitHub → auto-deploy)

## Commands
```
npm run dev          # local preview at localhost:5173
npm run dev -- --host  # preview on phone via local network
npm run build        # production build → dist/
```

## Architecture
All app logic lives in `src/App.jsx`. No separate state management, no router.

**Supabase tables:** `households`, `recipes` (150 rows, already seeded), `sessions`, `votes`, `never_again`

**Key constants in App.jsx:**
- `HOUSEHOLD_ID = "diogo-sara-2025"` — fixed, never change
- `PLAYERS = ["Diogo", "Sara"]`
- `SESSION_SIZE = 15`, `ONBOARDING_SIZE = 50`
- `TARGET_MIN = 6`, `TARGET_MAX = 8`

**Screens:** loading → setup → swipe → results
**Session flow:** one player creates (gets 5-char code) → partner enters code → both swipe independently → matches = both liked

## Code style
- Functional components, hooks only
- Inline styles (no CSS files, no Tailwind)
- Portuguese UI strings throughout
- Keep everything in one file unless asked otherwise

## What Claude gets wrong
- Never add new npm packages without asking first
- Never split App.jsx into multiple components unless explicitly asked
- Never change HOUSEHOLD_ID or PLAYERS array
- Recipe data lives in Supabase — do not hardcode recipes in the app
- For UI changes: run `npm run dev` and confirm it builds before suggesting done

## Deploy
Push to GitHub → Netlify auto-deploys. Build command: `npm run build`. Publish dir: `dist`.
