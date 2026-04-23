export const PUBLISH_CONFIG = {
  visibilityMode: 'private',
  liveExternalData: true,
}

export function isPublicMode() {
  return PUBLISH_CONFIG.visibilityMode === 'public'
}

export function isLiveExternalDataEnabled() {
  return PUBLISH_CONFIG.liveExternalData !== false
}
