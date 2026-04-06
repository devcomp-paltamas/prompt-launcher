import fs from 'node:fs'
import path from 'node:path'
import { BlobPreconditionFailedError, get, head, put } from '@vercel/blob'

const STORAGE_PATHNAME = 'prompt-launcher/prompts.json'
const LOCAL_FILE_PATH = path.join(process.cwd(), 'src/data/prompts.json')

function readSeedFile() {
  const raw = fs.readFileSync(LOCAL_FILE_PATH, 'utf-8')
  const parsed = JSON.parse(raw)

  return {
    settings: typeof parsed.settings === 'object' && parsed.settings !== null ? parsed.settings : {},
    mcps: Array.isArray(parsed.mcps) ? parsed.mcps : [],
    collections: Array.isArray(parsed.collections) ? parsed.collections : [],
  }
}

export function hasBlobStore() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

export function readLocalPromptCollections() {
  return readSeedFile()
}

async function seedBlobFromLocalFile(seedData) {
  const payload = JSON.stringify({
    settings: seedData.settings,
    mcps: seedData.mcps,
    collections: seedData.collections,
  }, null, 2)

  await put(STORAGE_PATHNAME, payload, {
    access: 'private',
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: 'application/json; charset=utf-8',
  })

  const metadata = await head(STORAGE_PATHNAME)

  return {
    settings: seedData.settings,
    mcps: seedData.mcps,
    collections: seedData.collections,
    etag: metadata.etag,
    source: 'blob',
    migrated: true,
  }
}

export async function readPromptCollections() {
  const seedData = readSeedFile()

  if (!hasBlobStore()) {
    return {
      settings: seedData.settings,
      mcps: seedData.mcps,
      collections: seedData.collections,
      etag: null,
      source: 'seed',
      migrated: false,
    }
  }

  const blobResult = await get(STORAGE_PATHNAME, {
    access: 'private',
    useCache: false,
  })

  if (!blobResult) {
    return seedBlobFromLocalFile(seedData)
  }

  if (blobResult.statusCode !== 200) {
    return seedBlobFromLocalFile(seedData)
  }

  const text = await new Response(blobResult.stream).text()
  const parsed = JSON.parse(text)

  return {
    settings: typeof parsed.settings === 'object' && parsed.settings !== null ? parsed.settings : seedData.settings,
    mcps: Array.isArray(parsed.mcps) ? parsed.mcps : seedData.mcps,
    collections: Array.isArray(parsed.collections) ? parsed.collections : seedData.collections,
    etag: blobResult.blob.etag,
    source: 'blob',
    migrated: false,
  }
}

export async function writePromptCollections(payloadData, options = {}) {
  const currentData = readSeedFile()
  const isLegacyCollectionsOnlyPayload = Array.isArray(payloadData)

  const settings = isLegacyCollectionsOnlyPayload
    ? currentData.settings
    : typeof payloadData?.settings === 'object' && payloadData.settings !== null
      ? payloadData.settings
      : {}

  const mcps = isLegacyCollectionsOnlyPayload
    ? currentData.mcps
    : Array.isArray(payloadData?.mcps)
      ? payloadData.mcps
      : []

  const collections = isLegacyCollectionsOnlyPayload
    ? payloadData
    : Array.isArray(payloadData?.collections)
      ? payloadData.collections
      : []

  const shouldPreserveExistingContent = !isLegacyCollectionsOnlyPayload
    && collections.length === 0
    && currentData.collections.length > 0

  const safeMcps = shouldPreserveExistingContent ? currentData.mcps : mcps
  const safeCollections = shouldPreserveExistingContent ? currentData.collections : collections

  const payload = JSON.stringify({ settings, mcps: safeMcps, collections: safeCollections }, null, 2)
  const { etag = null, fallbackToFile = false } = options

  if (!hasBlobStore()) {
    if (!fallbackToFile) {
      const error = new Error('Vercel Blob nincs konfigurálva.')
      error.code = 'BLOB_NOT_CONFIGURED'
      throw error
    }

    fs.writeFileSync(LOCAL_FILE_PATH, payload, 'utf-8')

    return {
      etag: null,
      source: 'file',
    }
  }

  const putOptions = {
    access: 'private',
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: 'application/json; charset=utf-8',
  }

  if (etag) {
    putOptions.ifMatch = etag
  }

  await put(STORAGE_PATHNAME, payload, putOptions)

  const metadata = await head(STORAGE_PATHNAME)

  return {
    etag: metadata.etag,
    source: 'blob',
  }
}

export { BlobPreconditionFailedError }
