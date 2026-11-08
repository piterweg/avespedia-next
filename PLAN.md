# Plan migracji avespedia.com

## Status: fundament gotowy, tresc zaimportowana

### Zrobione
- [x] repo Next 16 + Payload 3.93 (SQLite lokalnie), panel /admin dziala
- [x] model tresci: articles, species, categories, media, users, site-settings
- [x] `wp:fetch` - 922 wpisy, 46 kategorii, 2 strony, 902 media
- [x] `wp:import` - kategorie + media + artykuly (idempotentne po `wpId`)
- [x] frontend: home, artykul, archiwum, kategoria, katalog gatunkow
- [x] SEO: sitemap, robots, JSON-LD, canonical, 49 x 301 (redirects.json)
- [x] `wp:fix-assets` - przepisanie obrazow z WP na lokalne
- [x] git + pierwszy commit, CI workflow

### Nastepne
- [ ] Postgres + R2 na produkcje
- [ ] ISR zamiast force-dynamic
- [ ] zasilenie `species` (katalog gatunkow)
- [ ] smoke testy + Lighthouse
- [ ] staging na subdomenie -> porownanie -> przelaczenie DNS
- [ ] wylaczenie WordPressa po 2-4 tygodniach obserwacji

## Zasady
- Slug artykulu = stary slug WP (zero ryzyka SEO).
- Tresc z WP jako `legacyHtml` do czasu normalizacji do Lexical.
- Baza lokalna SQLite, produkcyjnie Postgres - import odtwarzalny, wiec baza jest jednorazowa.
- Nie usuwamy WordPressa do czasu, az nowy serwis postoi na produkcji 2-4 tygodnie.