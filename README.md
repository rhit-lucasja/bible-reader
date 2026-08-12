# Ignis Divinus
A modern Bible reader featuring multiple common translations, AI-powered semantic search, and personalized notetaking.

![Home Page](assets/images/home.png)

![Reader: John 3 NABRE](assets/images/john3.png)

## Overview
Ignis Divinus is a full-stack web application for reading, searching, and studying Scripture across multiple translations. It offers both traditional keyword search and AI-powered semantic search, so you can look for specific phrases or search by concept. Users can create accounts, leave notes on bookmarked verses, and track their reading history across sessions. Ignis Divinus brings accessible, pocket-sized Scripture to your browser!

This project was built from scratch as a learning exercise, covering full-stack engineering practices such as monorepo architecture, containerized local development, CI/CD pipelines, and LLM integrations.

## Features
* __Multi-Translation Reader__:
Browse Scripture across multiple translations, smoothly navigating between books and chapters.
* __Semantic Search__:
Find passages by theme, concept, or meaning via dense vector embeddings. Combine with traditional keyword search for the best of both worlds!
* __Bookmarks & Notes__:
Save specific verses and leave personal notes for later review. Filter saved bookmarks by translation, book, and chapter.
* __Reading History__:
Quickly revisit chapters you have read across previous sessions.
* __User Accounts__:
Leverage secure Google OAuth to save reading history and user preferences.
* __Responsive Design__:
Adaptive layouts and light/dark displays make Ignis Divinus fit for any device.

## Tech Stack
__Layer__ | __Technology__
-|-
Monorepo | Turborepo + npm
Frontend | Next.js App Router, TypeScript, Tailwind CSS
API | tRPC, TypeScript
Database | PostgreSQL + pgvector
ORM | Prisma
Auth | Auth.js (Google OAuth, JWT sessions)
Embeddings | Ollama for local development, Nomic Atlas for production
Containerization | Docker + Docker Compose
CI/CD | GitHub Actions
Frontend Hosting | Vercel
API Hosting | Render
Database Hosting | Supabase

## Repository Structure
~~~
bible-reader/
|-- apps/
|   |-- web/        # Next.js frontend
|   |-- api/        # tRPC backend
|-- packages/
|   |-- db/         # Prisma schema, migrations, seed & embed scripts
|   |-- types/      # Shared TypeScript types
|   |-- config/     # Shared ESLint, tsconfig, Prettier config
|-- .github/
|   |-- workflows/
|   |   |-- ci.yml  # Lint, typecheck on every PR
|   |   |-- cd.yml  # Deploy to Vercel + Render on merge to main
|-- docker-compose.yml
|-- turbo.json
~~~

## Requirements
__Tool__ | __Version__ | __Purpose__
-|-|-
Node.js | $$\geq20.0.0$$ | JavaScript runtime
npm | $$\geq10.0.0$$ | Package manager
Docker | $$\geq24$$ | Local container services
Docker Compose | v2 | Multi-container orchestration
Ollama | Latest | Local embedding model inference point
Git | Any | Version control

__Windows Users__: Run Docker Engine and development commands inside WSL 2 (Ubuntu) rather than native Windows for Docker mounting and networking to behave as expected. See [WSL 2 setup](https://learn.microsoft.com/en-us/windows/wsl/install).

## Getting Started

### 1. Clone the repository

### 2. Install dependencies
Run from the repo root to install packages for every app and package simultaneously via npm:
~~~
npm install
~~~

### 3. Set up environment variables
~~~
cp .env.example .env
~~~
Open `.env` and fill in the required values. See __Environment Variables__ below for a full reference.

### 4. Pull the Ollama embedding model
Ollama must be running before starting the stack. The `nomic-embed-text` model is used for semantic search embeddings.
~~~
# Start Ollama in background
ollama serve &

# Pull the embedding model
ollama pull nomic-embed-text

# Verify it works
curl http://localhost:11434/api/version
~~~

### 5. Start the development stack
~~~
docker compose up
~~~
This starts three services:

__Service__ | __URL__ | __Description__
-|-|-
`web` | http://localhost:3000 | Next.js frontend (with hot reload)
`api` | http://localhost:3001 | tRPC Express API (with hot reload)
`db` | localhost:5432 | PostgreSQL + pgvector

A `migrate` service also runs automatically on startup to apply pending Prisma migrations and enable the `vector` extension on a fresh database.

### 6. Seed the database
Populate the database with Bible translation data. This fetches from various online sources and inserts normalized translations, books, chapters, and verses.
~~~
cd packages/db
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bible_reader" \
npx tsx src/seed.ts
~~~
Seeding locally should take about 5-10 minutes.

### 7. Generate embeddings
Compute and store vector embeddings for the canonical translation (in this project, NABRE). Used for semantic search, this is a one-time operation per database.
~~~
OLLAMA_URL="http://localhost:11434" \
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bible_reader" \
npx tsx src/embed.ts
~~~
Embeddings >30,000 verses takes approximately 20-60 minutes depending on hardware.

### 8. Interact with the app
The app should now be fully functional http://localhost:3000.

## Environment Variables
Copy `.env.example` to `.env` and fill in each value. The table below explains each variable, its role, and where it is required.

__Variable__ | __Description__ | __Dev__ | __Vercel__ | __Render__
-|-|-|-|-
`DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/bible_reader` | Supabase pooler URL | Supabase pooler URL
`WEB_URL` | Frontend origin | `http://localhost:3000` | - | Vercel production URL
`NEXTAUTH_URL` | Canonical frontend URL for Auth.js | `http://localhost:3000` | Vercel production URL | -
`NEXTAUTH_SECRET` | Secret for signing Auth.js JWTs | Any string | Strong random value | -
`AUTH_GOOGLE_ID` | Google OAuth client ID | From Google Cloud Console | Same as dev | -
`AUTH_GOOGLE_SECRET` | Google OAuth client secret | From Google Cloud Console | Same as dev | -
`EMBEDDING_PROVIDER` | `ollama` or `nomic` | `ollama` | - | `nomic`
`OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` | - | -
`NOMIC_API_KEY` | Nomic Atlas API key (production embeddings) | - | - | From Nomic dashboard
`NODE_ENV` | Environment name | `development` | Auto-set | Auto-set
`INTERNAL_API_URL` | URL the Next.js server uses to reach the API | `http://api:3001` (Docker) | Render API URL | -
`PROXY_SECRET` | Shared secret between Next.js proxy and API | Any string | Strong random value | Same as vercel

__Note__: `NEXTAUTH_SECRET` and `PROXY_SECRET` must be identical across any environments that share a session. Generate strong values with `openssl`.

## Development Reference

### Common Commands
Run all commands from repo root unless otherwise noted.
~~~
# Start full local stack
docker compose up

# Start in background
docker compose up -d

# Rebuild a specific service after dependency changes
docker compose build --no-cache api
docker compose build --no-cache web

# Stop all services (preserving database contents)
docker compose down

# Stop all services AND wipe the database
docker compose down -v

# Run lint across all workspaces
npm run lint

# Run typecheck across all workspaces
npm run typecheck
~~~

### Database Commands
Run from `packages/db` with `DATABASE_URL` set.
~~~
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration from schema changes (local dev only)
DATABASE_URL="..." npx prisma migrate dev --name migration_name

# Apply existing migrations (used in production and CI)
DATABASE_URL="..." npx prisma migrate deploy

# Seed Bible content
DATABASE_URL="..." npx tsx src/seed.ts

# Generate embeddings for semantic search
OLLAMA_BASE_URL="..." DATABASE_URL="..." npx tsx src/embed.ts
~~~

## CI/CD

### Continuous Integration (`ci.yml`)
Runs on every push to a non-main branch and on all pull requests targeting `main`.
* Lint (`turbo lint`)
* Typecheck (`turbo typecheck`)

PRs cannot be merged to `main` without CI passing.

### Continuous Deployment (`cd.yml`)
Runs on every merge to `main`.
* Triggers a Vercel production deployment (frontend)
* Triggers a Render deploy hook (API)

Render automatically runs `prisma migrate deploy` as part of its build command before starting the server.

## Project Architecture
All browser-to-API communication is routed through a Next.js proxy endpoint rather than directly to Render. This avoids cross-origin cookie issues and keeps the Render URL private from the browser.

## Contributions
This is a personal portfolio project and is not currently open for external contributions. Issues and feedback are always welcome.

## License
MIT &copy; 2026 Lucas J.