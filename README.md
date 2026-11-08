# Avespedia (Next.js 16 + Payload 3)

Nowa wersja https://avespedia.com/ - migracja z WordPressa.

## Uruchomienie

    npm install
    npm run dev

Panel CMS: http://localhost:3000/admin

## Pipeline migracji

    npm run wp:fetch    # pobiera 922 wpisy + kategorie + media z WP REST API do data/wp/
    npm run wp:import   # importuje dane do Payload (slug = stary URL)

Flagi importera: `--limit=50`, `--skip-media`, `--skip-content`.

## Struktura

- `src/app/(frontend)` - publiczny serwis (Next.js App Router)
- `src/app/(payload)` - panel admina i REST/GraphQL API Payload
- `src/payload/collections` - model tresci (articles, species, categories, media, users)
- `scripts` - migracja z WordPressa

## Baza

Domyslnie SQLite (`avespedia.db`). Zmiana na Postgres = podmiana adaptera w `payload.config.ts`
i re-import tresci (dane sa odtwarzalne skryptem, wiec baza jest jednorazowa).