# Prompt Launcher - Vercel Deploy

## Mi van előkészítve?

- `vercel.json` a build/output beállításokkal
- `.vercelignore` a felesleges lokális fájlok kizárására
- frissített `.gitignore`

## Gyors deploy GitHub-ból

1. Töltsd fel a projektet GitHubra.
2. Nyisd meg a [Vercel](https://vercel.com/) oldalt.
3. **Add New...** → **Project**
4. Importáld a GitHub repót.
5. A Vercel fel fogja ismerni, hogy Vite projekt.
6. Ellenőrizd ezeket az értékeket:
   - **Framework Preset:** `Vite`
   - **Install Command:** `npm install`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
7. Kattints a **Deploy** gombra.

## Storage beállítás

Ez a verzió már Vercel Blob perzisztenciára van előkészítve.

Tedd meg ezt a Vercelben:

1. Project → **Storage**
2. Hozz létre vagy csatlakoztass egy **Blob** store-t
3. Kösd hozzá ehhez a projekthez
4. Redeploy

Ha a Blob store csatlakoztatva van, a Vercel automatikusan elérhetővé teszi a `BLOB_READ_WRITE_TOKEN` környezeti változót a függvényeknek.

## Environment variables

Kézi `.env` beállítás Vercelben általában nem kell, ha a Blob store a projektedhez van kapcsolva.

Lokális fejlesztéshez opcionálisan be tudod húzni:

```bash
vercel env pull .env.local
```

Így a `npm run dev` is a Vercel Blobot tudja használni.

## Hogy működik most

- `GET /api/prompts` betölti az adatokat a Vercel Blobból
- `POST /api/prompts` oda menti vissza a teljes kollekciós JSON-t
- ha a Blob store üres, az első betöltés automatikusan átmásolja a repóban lévő `src/data/prompts.json` seed adatot a Blobba
- ha a Blob még nincs bekötve, fallbackként a repóban lévő `src/data/prompts.json` induló adat lesz használva

## Projekt fájlok

- `api/prompts.js` - Vercel Function az olvasáshoz és mentéshez
- `lib/promptStore.js` - közös storage logika
- `vercel.json` - build konfiguráció

## Lokális ellenőrzés deploy előtt

```bash
npm install
npm run build
```

Ha ez sikeres, a projekt deployolható Vercelbe.
