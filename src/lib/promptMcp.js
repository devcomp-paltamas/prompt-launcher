export const DEFAULT_MCP_OPTIONS = [
  {
    id: 'abap-adt',
    label: 'ABAP ADT',
    shortLabel: 'abap-adt',
    description: 'SAP objektumok lekérése, elemzése és módosítása.',
    instruction: 'Használd az abap-adt MCP szervert a szükséges SAP objektumok lekéréséhez, elemzéséhez és módosításához.',
    color: '#60a5fa',
  },
  {
    id: 'sap-docs',
    label: 'SAP Docs',
    shortLabel: 'sap-docs',
    description: 'Hivatalos SAP dokumentáció és release információk ellenőrzése.',
    instruction: 'Használd a sap-docs MCP-t hivatalos SAP dokumentáció, release információ és ajánlott API-k ellenőrzéséhez.',
    color: '#55efc4',
  },
]

const LEGACY_TOOL_TO_MCP_ID = {
  adt: 'abap-adt',
  docs: 'sap-docs',
}

function hexToRgba(hex, alpha = 0.15) {
  if (typeof hex !== 'string') {
    return `rgba(0,112,243,${alpha})`
  }

  const normalized = hex.replace('#', '').trim()
  const expanded = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return `rgba(0,112,243,${alpha})`
  }

  const value = Number.parseInt(expanded, 16)
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255

  return `rgba(${red},${green},${blue},${alpha})`
}

function normalizeColor(value) {
  if (typeof value !== 'string') {
    return '#60a5fa'
  }

  const trimmed = value.trim()
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)
    ? trimmed
    : '#60a5fa'
}

export function createMcpId(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeMcpOptions(options = []) {
  const source = Array.isArray(options)
    ? options
    : DEFAULT_MCP_OPTIONS

  const seenIds = new Set()

  return source.reduce((result, option, index) => {
    const fallbackId = `mcp-${index + 1}`
    const id = createMcpId(option?.id || option?.shortLabel || option?.label || fallbackId) || fallbackId

    if (seenIds.has(id)) {
      return result
    }

    seenIds.add(id)

    const color = normalizeColor(option?.color)
    const label = String(option?.label || id).trim()
    const shortLabel = String(option?.shortLabel || id).trim()
    const description = String(option?.description || '').trim()
    const instruction = String(option?.instruction || '').trim()

    result.push({
      id,
      label,
      shortLabel,
      description,
      instruction,
      color,
      background: option?.background || hexToRgba(color, 0.16),
    })

    return result
  }, [])
}

function getRegistry(registry = DEFAULT_MCP_OPTIONS) {
  return normalizeMcpOptions(registry)
}

export function normalizeMcpId(value, registry = DEFAULT_MCP_OPTIONS) {
  if (!value || typeof value !== 'string') return null

  const normalizedValue = value.trim()
  const normalizedRegistry = getRegistry(registry)
  const registryIds = new Set(normalizedRegistry.map(option => option.id))

  if (registryIds.has(normalizedValue)) {
    return normalizedValue
  }

  const legacyId = LEGACY_TOOL_TO_MCP_ID[normalizedValue]
  return legacyId && registryIds.has(legacyId) ? legacyId : null
}

export function getMcpDefinition(mcpId, registry = DEFAULT_MCP_OPTIONS) {
  const normalizedId = normalizeMcpId(mcpId, registry)
  return getRegistry(registry).find(option => option.id === normalizedId) || null
}

export function getPromptMcpIds(prompt, registry = DEFAULT_MCP_OPTIONS) {
  const rawMcps = Array.isArray(prompt?.mcps)
    ? prompt.mcps
    : Array.isArray(prompt?.tools)
      ? prompt.tools
      : []

  return rawMcps
    .map(entry => (typeof entry === 'string' ? entry : entry?.id))
    .map(entry => normalizeMcpId(entry, registry))
    .filter((value, index, array) => value && array.indexOf(value) === index)
}

export function getDefaultPromptMcpId(prompt, registry = DEFAULT_MCP_OPTIONS) {
  const mcps = getPromptMcpIds(prompt, registry)
  const requestedDefaultId = normalizeMcpId(prompt?.defaultMcpId || prompt?.defaultToolId, registry)

  if (requestedDefaultId && mcps.includes(requestedDefaultId)) {
    return requestedDefaultId
  }

  return mcps[0] || ''
}

export function normalizePrompt(prompt, registry = DEFAULT_MCP_OPTIONS) {
  if (!prompt) return prompt

  const mcps = getPromptMcpIds(prompt, registry)
  const defaultMcpId = getDefaultPromptMcpId({ ...prompt, mcps }, registry)

  return {
    ...prompt,
    mcps,
    defaultMcpId,
  }
}

export function normalizeCollections(collections = [], registry = DEFAULT_MCP_OPTIONS) {
  return collections.map(collection => ({
    ...collection,
    prompts: Array.isArray(collection.prompts)
      ? collection.prompts.map(prompt => normalizePrompt(prompt, registry))
      : [],
  }))
}

export function buildPromptWithMcp(promptBody, mcpId, registry = DEFAULT_MCP_OPTIONS) {
  const body = (promptBody || '').trim()
  const instruction = getMcpDefinition(mcpId, registry)?.instruction?.trim() || ''

  if (!instruction) return body
  if (!body) return instruction

  return `${instruction}\n\n${body}`
}

export function buildFinalPrompt({
  promptBody,
  mcpId,
  registry = DEFAULT_MCP_OPTIONS,
  systemPrompt = '',
}) {
  const parts = [
    String(systemPrompt || '').trim(),
    buildPromptWithMcp(promptBody, mcpId, registry).trim(),
  ].filter(Boolean)

  return parts.join('\n\n')
}
