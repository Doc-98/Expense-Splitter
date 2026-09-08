import { useState } from 'react'
import { useEscapeKey } from '../lib/useEscapeKey'

// The bottom-sheet equivalent of what used to be TypedConfirmModal — same
// "type the exact word to confirm" gate (case-sensitive, no trimming; the
// point is a deliberate, accurate copy, not a loose match), just in
// ConfirmSheet's sliding-up-from-the-bottom chrome instead of a centered
// dialog. Reserved for the truly hard-to-reverse actions (wiping a group's
// entire bill history, deleting the group itself) — anything merely worth
// a plain "are you sure" (Leave group, Sign out) stays on ConfirmSheet
// itself; this is the heavier version for when a click alone is too easy
// to do by habit.
export default function TypedConfirmSheet({
  title,
  body,
  confirmWord,
  confirmLabel,
  pending = false,
  onConfirm,
  onCancel,
}) {
  const [typed, setTyped] = useState('')
  const matches = typed.length > 0 && typed === confirmWord
  useEscapeKey(onCancel, !pending)

  return (
    <div className="sheet-backdrop" onClick={(e) => !pending && e.target === e.currentTarget && onCancel()}>
      <div className="sheet-panel" role="dialog" aria-modal="true" aria-labelledby="typed-confirm-sheet-title">
        <div className="sheet-grabber" aria-hidden="true" />
        <h2 id="typed-confirm-sheet-title">{title}</h2>
        {body}
        <p className="typed-confirm-prompt">
          Type <strong>{confirmWord}</strong> to confirm:
        </p>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={confirmWord}
          disabled={pending}
          autoFocus
        />
        <div className="sheet-actions">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </button>
          <button type="button" className="btn-danger" disabled={!matches || pending} onClick={onConfirm}>
            {pending ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
