export const DEFAULT_APP_SETTINGS = {
  systemPrompt: '',
}

export function normalizeAppSettings(settings) {
  return {
    systemPrompt: typeof settings?.systemPrompt === 'string'
      ? settings.systemPrompt
      : DEFAULT_APP_SETTINGS.systemPrompt,
  }
}
