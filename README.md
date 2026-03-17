[中文](./README_zh.md) | **English**

# MoneyKeeper Vue

![Vue](https://img.shields.io/badge/Vue-3.x-42b883?style=flat-square)
![Element Plus](https://img.shields.io/badge/UI-Element%20Plus-409eff?style=flat-square)
![Pinia](https://img.shields.io/badge/State-Pinia-f7c948?style=flat-square)
![Cloudflare Workers](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-f38020?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-enabled-2496ed?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active%20Development-2ea44f?style=flat-square)

MoneyKeeper Vue is the web frontend for the MoneyKeeper platform. It started as a personal bookkeeping app and has now grown into a ledger-based workspace for records, categories, budgets, notifications, exports, search, collaboration, and billing.

## What's New

- Ledger-based workspace with platform navigation
- Dedicated pages for budgets, notifications, export jobs, statistics, search, and ledger members
- Cloudflare Workers deployment support with SPA routing
- Docker image build and push pipeline on `main`
- Stripe billing flow updated to backend-driven checkout sessions

## Features

### Core bookkeeping
- Record income and expense entries
- Category-based filtering and summaries
- Monthly accounting dashboard
- Editable records and categories

### Ledger workspace
- Ledger list and current ledger context
- Ledger-scoped categories
- Ledger budgets and budget rules
- Ledger statistics and search
- Ledger members and invite flows

### Platform capabilities
- Notification center with unread state
- Export job tracking and downloads
- Stripe billing pages
- SSE-powered realtime status updates

## Routes

- `/accounting` — accounting dashboard
- `/ledgers` — ledger center
- `/ledgers/:ledgerId/members` — ledger members and invites
- `/categories` — ledger category management
- `/budgets` — ledger budgets
- `/statistics` — ledger statistics
- `/search` — record search
- `/exports` — export jobs
- `/notifications` — notification center
- `/billing` — billing and checkout
- `/login` — authentication

## Tech Stack

- Vue 3
- Vue Router
- Pinia
- Element Plus
- Axios
- ECharts / Vue-ECharts
- Tailwind CSS
- Vue CLI

## Development

### Requirements

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run locally

```bash
npm run serve
```

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

## Runtime configuration

The frontend uses different base URLs for REST API and SSE in production.

### Development

- REST API: `/api`
- SSE: `/api`

### Production

- REST API: configured through runtime/env
- SSE: configured through runtime/env
- Cloudflare Workers handles SPA routing

See:

- [`PROJECT_DETAILS.md`](./PROJECT_DETAILS.md)
- [`wrangler.jsonc`](./wrangler.jsonc)

## API contract notes

- Frontend state uses `income` / `expense`
- Records and categories should also send `income` / `expense` to the backend
- When backend documents change, check `C:\WorkSpace\Java\moneykeeper-back\FRONTEND_API.md` before updating request/response mapping

## CI/CD

GitHub Actions builds and pushes a Docker image on `main`.

Workflow:

- install dependencies
- run lint
- run production build
- build and push Docker image

See:

- [`.github/workflows/node.js.yml`](./.github/workflows/node.js.yml)
- [`Dockerfile`](./Dockerfile)
- [`nginx.conf`](./nginx.conf)

## Project structure

```text
src/
  api/
    mappers/
    modules/
  components/
  composables/
  constants/
  router/
  stores/
  utils/
  views/
```

## Current focus

- polish the ledger workspace UX
- keep frontend mappings aligned with the backend handoff
- continue cleanup of legacy copy and encoding issues
- prepare for future i18n adoption
