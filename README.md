# Avespedia (Next.js 16 + Payload 3)

Nowa wersja https://avespedia.com/ - migracja z WordPressa na Next.js z panelem Payload 3.
Zrodlo tresci: 922 wpisy, 46 kategorii, 902 obrazy z WP REST API.

## Quickstart

    npm install
    npm run wp:fetch        # pobiera cala tresc z WordPressa do data/wp/
    npm run wp:import       # importuje kategorie + media + artykuly do Payload
    npm run seed            # tworzy konto admina (jesli brak)
    npm run seo:redirects   # generuje redirects.json z kategorii WP
    npm run dev             # http://localhost:3000 (panel: /admin)

Konto admina z `npm run seed`: `admin@avespedia.local` / `Avespedia2026!`
(zmien haslo po pierwszym logowaniu). Nadpisz przez `SEED_ADMIN_EMAIL` i `SEED_ADMIN_PASSWORD`.

## Zmienne srodowiskowe

- `PAYLOAD_SECRET` - sekret Payload (wymagany)
- `DATABASE_URI` - domyslnie `file:./avespedia.db` (SQLite)
- `NEXT_PUBLIC_SITE_URL` - bazowy URL do canonical/JSON-LD/sitemap

Plik `.env` jest w `.gitignore`. Wzorzec: `.env.example`.

## Struktura

    payload.config.ts                 konfiguracja Payload (SQLite, lexical, sharp)
    src/payload/collections/          articles, species, categories, media, users
    src/payload/globals/              site-settings
    src/app/(frontend)/               publiczny serwis
      page.tsx                        strona glowna (najnowsze artykuly)
      [slug]/page.tsx                 artykul + JSON-LD + canonical
      articulos/page.tsx              archiwum
      categoria/[slug]/page.tsx       kategoria
      especies/                       katalog gatunkow
    src/app/(payload)/                panel admina + REST/GraphQL
    src/app/sitemap.ts, robots.ts     SEO
    scripts/                          migracja z WordPressa

## Model tresci

- **articles** - `slug` 1:1 ze starym URL-em WP, `legacyHtml` (HTML z WP), `body` (Lexical na przyszlosc),
  `seo.title` / `seo.description` z AIOSEO, `wpId` (idempotencja importu), `categories`, `featuredImage`
- **species** - katalog gatunkow (nazwa, nazwa lacinska, rodzina, IUCN, regiony, powiazane artykuly)
- **categories** - hierarchia z WordPressa (`parent`)
- **media** - obrazy w `media/` + 3 rozmiary (thumbnail/card/hero)

## SEO podczas migracji

- slugi artykulow = stare slugi WP, wiec adresy zostaja bez zmian
- `redirects.json`: 49 przekierowan 301 (`/category/*` -> `/categoria/*`, `/author/*`, `/page/*`)
- `sitemap.xml` i `robots.txt` generowane z bazy
- JSON-LD `BlogPosting` + `BreadcrumbList` na kazdym artykule
- `scripts/fix-assets.ts` przepisuje obrazy w tresci z `avespedia.com/wp-content/uploads/*`
  na lokalne `/api/media/file/*` (trzeba uruchomic po imporcie!)

## Czego jeszcze brakuje (kolejne kroki)

1. **Produkcyjna baza** - zamiana `sqliteAdapter` na `@payloadcms/db-postgres` (Neon/Supabase).
   Dane sa odtwarzalne skryptem, wiec to kwestia podmiany adaptera + re-importu.
2. **Storage obrazow** - Cloudflare R2 / S3 zamiast lokalnego `media/` (na Vercelu FS jest read-only).
3. **ISR zamiast `force-dynamic`** - na razie wszystkie strony renderuja sie dynamicznie.
4. **Katalog gatunkow** - `species` jest gotowe w modelu, ale trzeba zasilic dane i zbudowac widoki.
5. **Sitemap w indeksach** - podzielic na sitemap-index przy >50k URL (teraz niepotrzebne).
6. **Testy** - brak; minimum to smoke test stron kluczowych.
7. **Analityka + consent** - MonsterInsights/Site Kit do zastapienia.

## Deploy

- GitHub: repo `piterweg/avespedia-next` (branch `main`), CI w `.github/workflows/ci.yml`
- Vercel: import repo, ustaw `PAYLOAD_SECRET`, `DATABASE_URI` (Postgres), `NEXT_PUBLIC_SITE_URL`
- Przelaczenie DNS dopiero po porownaniu staging vs produkcja (stary WP zostaje jako rollback)

## Uwagi

- Payload 3.93 wymaga Node `^22.23.4 || >=24.22.1`; lokalnie dzialalo na 24.11 (warning, nie blad).
- Baza SQLite (`avespedia.db`) i katalog `media/` sa w `.gitignore` - nie trafiaja do repo.