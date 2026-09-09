import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { parseReceipt, currentStrategyLabel } from '../lib/receipt-parsing'

// A receipt could plausibly be more than a fresh photo — a PDF emailed by
// a store, a text/HTML export saved from a confirmation email. "Choose
// file" is the entry point that goes looking for any of those; "Take
// photo" stays image-only and always jumps straight to the camera (see
// the two separate <input>s below for why that split is two inputs, not
// one with a broader accept list).
const BROWSE_ACCEPT = 'image/*,application/pdf,text/plain,text/html'

export default function ScanReceiptButton({ scanning, setScanning, onScanned, onError, categories = [] }) {
  const cameraInputRef = useRef(null)
  const browseInputRef = useRef(null)
  const [progress, setProgress] = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file next time
    if (!file) return

    setScanning(true)
    setProgress(null)
    onError(null)

    try {
      const base64 = await fileToBase64(file)
      const categoryNames = categories.map((c) => c.name)
      const mediaType = guessMediaType(file)
      const { items } = await parseReceipt(base64, mediaType, (p) => setProgress(Math.round(p * 100)), categoryNames)
      if (!items?.length) {
        throw new Error('No items found on that receipt — try a clearer photo, or add items manually.')
      }
      onScanned(items)
    } catch (err) {
      onError(err.message || 'Could not read that receipt.')
    } finally {
      setScanning(false)
      setProgress(null)
    }
  }

  return (
    <div className="scan-row">
      {scanning ? (
        <p className="scan-status muted">
          {progress !== null ? `Reading receipt… ${progress}%` : 'Reading receipt…'}
        </p>
      ) : (
        <div className="scan-buttons">
          <button type="button" className="btn-secondary" onClick={() => cameraInputRef.current?.click()}>
            Take photo
          </button>
          <button type="button" className="btn-secondary" onClick={() => browseInputRef.current?.click()}>
            Choose file
          </button>
        </div>
      )}
      {/* Restricted to images, with capture set, so this one always jumps
          straight to the camera. iOS drops its own "Take Photo"/"Photo
          Library" shortcuts the moment accept includes a non-image type —
          which is exactly why this can't just be one input with a wider
          accept list; browsing needs its own, unrestricted one below. */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
      <input
        ref={browseInputRef}
        type="file"
        accept={BROWSE_ACCEPT}
        onChange={handleFile}
        style={{ display: 'none' }}
      />
      <p className="scan-strategy-note muted">
        Using: {currentStrategyLabel()} — <Link to="/scan-settings">change</Link>
      </p>
    </div>
  )
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Most browsers set File#type correctly for anything picked through an
// `accept`-filtered input, but it's not guaranteed — some mobile share
// sheets hand over a file with an empty type. Falls back to the extension,
// and finally to "it's a photo" (a camera capture always has a real type
// already, so this last resort only ever matters for the browse path).
function guessMediaType(file) {
  if (file.type) return file.type
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return 'application/pdf'
  if (name.endsWith('.html') || name.endsWith('.htm')) return 'text/html'
  if (name.endsWith('.txt')) return 'text/plain'
  return 'image/jpeg'
}
