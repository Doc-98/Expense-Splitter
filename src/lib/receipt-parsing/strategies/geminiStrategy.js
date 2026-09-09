import { getReceiptSettings } from '../../receiptSettings'
import { buildExtractionPrompt, extractJsonItems } from '../extractionPrompt'
import { mediaKindFor, base64ToText } from '../mediaKind'

const DEFAULT_MODEL = 'gemini-2.5-flash'

// Gemini attaches an image or a PDF the same way (inline_data carrying the
// file's own mime type). Plain text (or an HTML export) has no such part
// of its own, so it's inlined directly into the prompt as prose instead —
// same reasoning as claudeStrategy.js's own buildAttachmentBlock.
function buildAttachmentPart(imageBase64, mediaType, kind) {
  if (kind === 'text') {
    return { text: `Receipt text:\n\n${base64ToText(imageBase64)}` }
  }
  return { inline_data: { mime_type: mediaType, data: imageBase64 } }
}

async function callGemini(imageBase64, mediaType, apiKey, model, categoryNames) {
  const kind = mediaKindFor(mediaType)
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              buildAttachmentPart(imageBase64, mediaType, kind),
              { text: buildExtractionPrompt(categoryNames, kind) },
            ],
          },
        ],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  )

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API error (${response.status}): ${errText}`)
  }

  const data = await response.json()
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text
  return extractJsonItems(raw, categoryNames)
}

export const geminiStrategy = {
  id: 'gemini',
  label: 'Google Gemini (your API key)',
  isConfigured: () => Boolean(getReceiptSettings().geminiApiKey),
  parse: (imageBase64, mediaType, onProgress, categoryNames = []) => {
    const { geminiApiKey, geminiModel } = getReceiptSettings()
    if (!geminiApiKey) {
      throw new Error('No Gemini API key saved yet — add one in Scan settings.')
    }
    return callGemini(imageBase64, mediaType, geminiApiKey, geminiModel || DEFAULT_MODEL, categoryNames)
  },
}
