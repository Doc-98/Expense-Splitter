import { useEscapeKey } from '../lib/useEscapeKey'

// A bottom-sheet confirm dialog — Settings' Sign Out, its Groups section's
// Leave group, and Group Settings' own Danger Zone "Leave group" all use
// this instead of a plain window.confirm(), for a plain yes/no that's
// worth a beat of "are you sure" but doesn't need a typed confirmation
// (see TypedConfirmSheet for the ones that do — Delete all bills, Delete
// group) or the app's centered .modal-panel (MultiPayerModal and friends,
// content-heavy dialogs unrelated to confirming an action).
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
