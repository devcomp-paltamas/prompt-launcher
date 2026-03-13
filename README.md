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

## Projekt struktúra

```
src/
├── components/
│   ├── PromptLauncher.jsx   # Fő alkalmazás
│   ├── PromptCard.jsx       # Kártya komponens
│   ├── PromptModal.jsx      # Modal + változó kitöltés
│   └── ToolTag.jsx          # MCP tool badge
├── data/
│   └── prompts.js           # Prompt adatok + kategóriák
├── App.jsx
├── main.jsx
└── index.css
```

## Fejlesztési tervek

- [ ] Keresés / szűrés szöveg alapján
- [ ] Saját prompt hozzáadása (localStorage)
- [ ] Prompt export / import JSON
- [ ] Kedvencek jelölése
- [ ] Sötét/Világos téma váltó
