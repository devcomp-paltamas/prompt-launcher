# SAP ABAP MCP – Prompt Launcher

React + Vite alapú prompt kezelő Claude AI + MCP integrációhoz.

## Indítás

```bash
npm install
npm run dev
```

Megnyílik: http://localhost:5173

## Build

```bash
npm run build
```

## Vercel Deploy

Vercelre elő van készítve a projekt.

- Konfiguráció: `vercel.json`
- Leírás: [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)
- Perzisztens mentés: Vercel Blobbal
- A Vercelben a projekt alá csatlakoztatni kell egy Blob store-t

Fontos: productionben a `src/data/prompts.json` nem írható vissza. A közös mentés a Vercel Blob storage-be megy az `api/prompts.js` függvényen keresztül. Ha a Blob üres, az első betöltés automatikusan seedeli a Blobot a repóban lévő JSON alapján.

## Tesztek

```bash
npm test           # Összes teszt
npm run test:ui    # Playwright UI
```

### Vizuális képernyőkép összehasonlítás

```bash
npm run test:visual:update   # baseline képernyőképek létrehozása/frissítése
npm run test:visual          # aktuális állapot automatikus összehasonlítása a baseline-hoz
```

A baseline képek a `tests/visual.spec.js-snapshots` mappába kerülnek.
GitHubon PR esetén a `.github/workflows/visual-regression.yml` workflow automatikusan lefuttatja az összehasonlítást.

## Netlify Deploy

Lásd: [NETLIFY_DEPLOY.md](NETLIFY_DEPLOY.md)

## Funkciók

- Prompt gyűjtemények kezelése
- Kategóriák és szűrés
- Kedvencek (⭐)
- Változók kitöltése
- Előnézet szerkesztése és mentése
- Export / Import JSON
