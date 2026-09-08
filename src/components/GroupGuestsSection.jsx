import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { addGuest, setGuestActive, renameGuest, requestClaimLink, deleteGuestPermanently } from '../lib/members'
import { shareOrCopyText } from '../lib/shareText'
import { fetchGroupRosterData } from '../lib/prefetchGroupSettings'
import { groupRosterCache } from '../lib/groupRosterCache'
import TypedConfirmSheet from './TypedConfirmSheet'

export default function GroupGuestsSection() {
  const { groupId } = useParams()
  const { user } = useAuth()

  // Seeded straight from groupRosterCache, shared with
  // GroupMembersSection.jsx — see that file's own comment, and
  // groupRosterCache.js for why the two tabs share one cache entry.
  const cached = groupRosterCache.get(groupId)
  const [name, setName] = useState(cached?.name ?? '')
  const [adminId, setAdminId] = useState(cached?.adminId ?? null)
  const [members, setMembers] = useState(cached?.members ?? [])
  const [error, setError] = useState(null)
  const [guestName, setGuestName] = useState('')
  const [editingGuestId, setEditingGuestId] = useState(null)
  const [editingGuestName, setEditingGuestName] = useState('')
  const [claimStatus, setClaimStatus] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null) // archived guest up for permanent deletion, or null
  const [deleting, setDeleting] = useState(false)

  // Same "derive from the roster this section already has" reasoning as
  // GroupMembersSection — see that file's own comment.
  const myParticipantId = members.find((m) => m.userId === user.id)?.id
  const isAdmin = myParticipantId && myParticipantId === adminId

  const load = useCallback(async () => {
    setError(null)
    try {
      const data = await fetchGroupRosterData(groupId)
      setName(data.name)
      setAdminId(data.adminId)
      setMembers(data.members)
      groupRosterCache.set(groupId, data)
    } catch (err) {
      setError(err.message)
    }
  }, [groupId])

  useEffect(() => {
    load()
  }, [load])

  async function submitAddGuest(e) {
    e.preventDefault()
    if (!guestName.trim()) return
    setError(null)
    try {
      await addGuest(groupId, guestName.trim())
      setGuestName('')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function saveGuestRename(memberId) {
    if (!editingGuestName.trim()) return
    setError(null)
    try {
      await renameGuest(memberId, editingGuestName.trim())
      setEditingGuestId(null)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function toggleGuestActive(member, active) {
    setError(null)
    try {
      await setGuestActive(member.id, active)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function getClaimLink(member) {
    setError(null)
    try {
      const token = await requestClaimLink(member.id)
      const url = `${window.location.origin}/claim/${token}`
      const result = await shareOrCopyText(url, `Claim your history in ${name}`)
      if (result === 'copied') {
        setClaimStatus(`Claim link for ${member.name} copied — send it to them directly.`)
        setTimeout(() => setClaimStatus(null), 3000)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  // The actual safety check (zero bills, payments, or subscriptions still
  // referencing this guest) lives server-side, in delete_guest_permanently
  // itself — this just surfaces whatever it says. The sheet stays open on
  // failure (only a successful delete closes it), so exactly why it was
  // rejected — visible in this section's own error banner, showing dimmed
  // through the sheet backdrop — is still right there rather than needing
  // it reopened to see again.
  async function confirmDeletePermanently() {
    if (!deleteTarget) return
    setDeleting(true)
    setError(null)
    try {
      await deleteGuestPermanently(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const activeGuests = members.filter((m) => m.active && m.isGuest)
  const archivedGuests = members.filter((m) => !m.active && m.isGuest)

  return (
    <>
      <h2 className="settings-section-title">Guests ({activeGuests.length})</h2>
      <p className="muted">
        People without an account of their own — add anyone who's splitting a bill but doesn't want
        to sign up. They can be assigned to items and settled up with exactly like anyone else. If
        one of them decides to sign up for real later, "Get claim link" gives you a private link
        that hands them this exact history under their own account — send it directly to them, not
        to the whole group.
      </p>
      {claimStatus && <p className="status-success">{claimStatus}</p>}
      <ul className="member-list">
        {activeGuests.map((m) => (
          <li key={m.id} className="member-list-item">
            {editingGuestId === m.id ? (
              <form
                className="guest-rename-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  saveGuestRename(m.id)
                }}
              >
                <input value={editingGuestName} onChange={(e) => setEditingGuestName(e.target.value)} autoFocus />
                <button type="submit" className="btn-link">
                  Save
                </button>
                <button type="button" className="btn-link" onClick={() => setEditingGuestId(null)}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span>
                  {m.name} <span className="muted">(guest)</span>
                </span>
                <span className="member-list-actions">
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => {
                      setEditingGuestId(m.id)
                      setEditingGuestName(m.name)
                    }}
                  >
                    Rename
                  </button>
                  <button type="button" className="btn-link" onClick={() => getClaimLink(m)}>
                    Get claim link
                  </button>
                  <button type="button" className="btn-link dropdown-item-warn" onClick={() => toggleGuestActive(m, false)}>
                    Remove
                  </button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={submitAddGuest} className="inline-form">
        <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Guest's name" />
        <button type="submit" className="btn-primary">
          Add guest
        </button>
      </form>

      {archivedGuests.length > 0 && (
        <>
          <h2 className="settings-section-title">Archived guests</h2>
          <p className="muted">
            Kept on old bills, but won't be offered for new ones. Restore any time — or, if the
            group's admin, delete one permanently instead. That only works once they're not on any
            bill, payment, or subscription anymore; otherwise it's blocked rather than silently
            leaving something broken behind.
          </p>
          <ul className="member-list">
            {archivedGuests.map((m) => (
              <li key={m.id} className="member-list-item former">
                <span>{m.name}</span>
                <span className="member-list-actions">
                  <button type="button" className="btn-link" onClick={() => toggleGuestActive(m, true)}>
                    Restore
                  </button>
                  {isAdmin && (
                    <button type="button" className="btn-link dropdown-item-warn" onClick={() => setDeleteTarget(m)}>
                      Delete permanently
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {deleteTarget && (
        <TypedConfirmSheet
          title="Delete guest permanently"
          body={
            <p>
              This permanently deletes <strong>{deleteTarget.name}</strong> from <strong>{name}</strong> —
              this can't be undone. Only works if they're not on any bill, payment, or subscription
              anymore; if they are, this is blocked and says so rather than leaving something broken
              behind.
            </p>
          }
          confirmWord={deleteTarget.name}
          confirmLabel="Delete permanently"
          pending={deleting}
          onConfirm={confirmDeletePermanently}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {error && <p className="status-error">{error}</p>}
    </>
  )
}
