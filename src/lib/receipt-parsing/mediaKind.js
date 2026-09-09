// What the vision/LLM strategies need to know about a scanned attachment's
// type — a photo, a PDF, and plain text each get attached to a strategy's
// own API call differently (see claudeStrategy.js/geminiStrategy.js), and
// this is the one place that decides which of the three a given file is,
// so the three don't quietly drift out of sync on the same judgment call.
export function mediaKindFor(mediaType) {
  if (mediaType === 'application/pdf') return 'document'
  if (mediaType?.startsWith('text/')) return 'text'
  return 'image'
}

// Browser-native base64 decode (atob) is bytes-as-Latin1, not UTF-8 — this
// round-trips it through TextDecoder so accented characters in a scanned
// receipt's text/HTML export come through correctly rather than as
// mojibake.
export function base64ToText(base64) {
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}
