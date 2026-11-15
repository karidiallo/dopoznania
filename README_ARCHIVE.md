# do Poznania — archiwum / instrukcja treści

## Struktura
- `index.html` — główna podróż wideo sterowana scrollem (ciągle animowane wideo).
- `archiwum.html` — wybór edycji i galeria.
- `archive-data.js` — prosty manifest edycji i mediów do edycji.
- `assets/` — folder na zdjęcia JPG/WebP i filmy MP4.

## Publikowanie materiałów
1. Uzyskaj zgodę na publikację wizerunku, jeśli jest wymagana.
2. Wgraj zoptymalizowane zdjęcia i filmy do `assets/` (np. `assets/edycja-2026/zdjecie-01.webp`).
3. W `archive-data.js` dopisz obiekt edycji: `id`, `title`, `subtitle`, `year`, `cover`, `media`.
4. W `media` użyj `type: "photo"` lub `type: "video"`, `src`, `title` i opcjonalnie `poster` dla wideo.
5. Usuń `demo:true`, gdy używasz rzeczywistych materiałów.
6. Opublikuj ponownie pliki w Netlify.

Przykład rekordu: `{type:"photo", src:"assets/edycja-2026/01.webp", title:"Warsztaty — kadr 01"}`

## Linki
- Wszystkie edycje: `/archiwum.html`
- Wybrana edycja: `/archiwum.html?edycja=edycja-01`
- Formularz: `/index.html#zapisz-sie`

To jest statyczny prototyp: nie ma panelu CMS do publikacji bez ponownego wdrożenia. Placeholdery są graficznymi wycinkami dostarczonej drogi, a nie autentycznymi zdjęciami z warsztatów. Formularz na głównej stronie wymaga konfiguracji produkcyjnej Netlify Forms i informacji o prywatności.
