# Prompt Launcher - Netlify Deploy

## Gyors telepítés (Drag & Drop)

1. Nyisd meg a [Netlify](https://app.netlify.com) oldalt
2. Jelentkezz be vagy regisztrálj
3. A `dist` mappát húzd be a Netlify dashboardra
4. Kész! Kapsz egy publikus URL-t (pl. `random-name-12345.netlify.app`)

## GitHub-ból automatikus deploy

### Előkészítés

1. Töltsd fel a projektet GitHubra:
   ```bash
   git add .
   git commit -m "Netlify deploy"
   git push origin main
   ```

### Netlify beállítás

1. Netlify dashboardon: **Add new site** → **Import an existing project**
2. Válaszd ki a GitHub repót
3. Build beállítások (automatikusan felismeri a `netlify.toml` alapján):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Kattints a **Deploy site** gombra

### Eredmény

- Automatikus deploy minden `git push` után
- HTTPS automatikusan bekapcsolva
- Saját domain beállítható a Site settings-ben

## Fájlok

| Fájl | Leírás |
|------|--------|
| `netlify.toml` | Netlify konfiguráció |
| `dist/` | Buildelt production fájlok |

## Saját domain beállítása

1. Site settings → Domain management
2. Add custom domain
3. Kövesd a DNS beállítási útmutatót

## Troubleshooting

Ha a build sikertelen:
```bash
npm install
npm run build
```

Ha SPA routing nem működik, ellenőrizd hogy a `netlify.toml` tartalmazza a redirect szabályt.
