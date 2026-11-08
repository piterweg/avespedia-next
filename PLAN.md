# Plan migracji avespedia.com

## Faza 1 - fundament (teraz)
- [x] repo Next 16 + Payload 3 (SQLite lokalnie)
- [x] model tresci: articles, species, categories, media, users
- [ ] import 922 wpisow z WP REST API
- [ ] frontend: home, artykul, archiwum, katalog gatunkow

## Faza 2 - SEO bez strat
- [ ] slugi 1:1 z WordPressem (bez zmiany URL)
- [ ] sitemap.xml generowana z bazy
- [ ] JSON-LD (Article, BreadcrumbList, FAQPage)
- [ ] redirects.json + 301 dla starych sciezek `/category/*`, `/author/*`, `/wp-content/uploads/*`
- [ ] porownanie staging vs produkcja przed przelaczeniem DNS

## Faza 3 - produkcja
- [ ] Postgres (Neon) + storage obrazow (Cloudflare R2)
- [ ] Vercel/Node hosting, ISR zamiast force-dynamic
- [ ] analityka + consent
- [ ] GitHub: repo + CI (build) + deploy

## Decyzje
- Slug artykulow = stary slug WP (zero ryzyka SEO).
- Tresc z WP trzymana jako `legacyHtml` do czasu recznej normalizacji do Lexical.
- Baza lokalna SQLite, produkcyjnie Postgres - import jest odtwarzalny.