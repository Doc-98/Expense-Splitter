import { useEscapeKey } from '../lib/useEscapeKey'

// A bottom-sheet confirm dialog — Settings' Sign Out and its Groups
// section's Leave group both use this instead of a plain window.confirm(),
// since both actions are worth a beat of "are you sure" but neither
// carries enough detail to need the app's existing centered .modal-panel
// (that pattern — MultiPayerModal, the delete-all-bills typed confirm —
// stays as it is; this is a separate, deliberately lighter pattern for a
// plain yes/no).
export default function ConfirmSheet({ title, body, confirmLabel, onConfirm, onCancel }) {
  useEscapeKey(onCancel, true)

  return (
    <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="sheet-panel" role="dialog" aria-modal="true" aria-labelledby="confirm-sheet-title">
        <div className="sheet-grabber" aria-hidden="true" />
        <h2 id="confirm-sheet-title">{title}</h2>
        <p>{body}</p>
        <div className="sheet-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
