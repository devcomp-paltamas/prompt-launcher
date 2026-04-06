import { BlobPreconditionFailedError, hasBlobStore, readPromptCollections, writePromptCollections } from '../lib/promptStore.js'

export async function GET() {
  try {
    const data = await readPromptCollections()

    return Response.json({
      settings: data.settings,
      mcps: data.mcps,
      collections: data.collections,
      etag: data.etag,
      storage: data.source,
      migrated: Boolean(data.migrated),
      blobConfigured: hasBlobStore(),
    })
  } catch (error) {
    return Response.json(
      { error: error.message || 'Nem sikerült betölteni a promptokat.' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const settings = typeof body?.settings === 'object' && body.settings !== null ? body.settings : null
    const mcps = Array.isArray(body?.mcps) ? body.mcps : null
    const collections = Array.isArray(body?.collections) ? body.collections : null

    if (!settings || !mcps || !collections) {
      return Response.json(
        { error: 'Érvénytelen payload: hiányzó settings, mcps vagy collections.' },
        { status: 400 }
      )
    }

    const result = await writePromptCollections({ settings, mcps, collections }, {
      etag: body?.etag || null,
    })

    return Response.json({
      success: true,
      etag: result.etag,
      storage: result.source,
    })
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) {
      return Response.json(
        { error: 'A távoli adat időközben megváltozott. Frissítsd az oldalt és próbáld újra.' },
        { status: 409 }
      )
    }

    if (error?.code === 'BLOB_NOT_CONFIGURED') {
      return Response.json(
        { error: 'A Vercel Blob nincs konfigurálva ehhez a projekthez.' },
        { status: 503 }
      )
    }

    return Response.json(
      { error: error.message || 'Nem sikerült menteni a promptokat.' },
      { status: 500 }
    )
  }
}
