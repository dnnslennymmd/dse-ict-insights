# DSE ICT Insights

ICT-style market structure analysis for the Dar es Salaam Stock Exchange (DSE).

## Features

- **Market Pulse** — indices, movers, ICT attention list, DSE session clock
- **Symbol workspace** — candlestick charts with FVG, liquidity pools, order blocks
- **Setup cards** — bias, entry zone, stop, target, TZS position sizing, fee estimates
- **Watchlist & alerts** — sweep and setup notifications
- **Paper trading** — practice before using Hisa Kiganjani
- **Trade journal** — thesis, emotions, CSV export
- **Learn** — DSE-specific ICT playbook

## Quick start

```bash
npm install
npm run db:push
npm run refresh-data
npm run dev
```

Open http://localhost:3000

## Environment

Copy `.env.example` to `apps/web/.env.local` and set `MANSA_API_KEY` for live Mansa API data.

## Disclaimer

Educational market analysis tool. Not investment advice. Not a licensed broker.
Trade through your CDS broker or Hisa Kiganjani.

## Monorepo structure

- `apps/web` — Next.js dashboard
- `packages/ict-engine` — ICT detection logic (tested with Vitest)
- `packages/dse-data` — Mansa API + synthetic seed data
- `packages/shared` — shared types
