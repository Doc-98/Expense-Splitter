import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useClickOutside } from '../lib/useClickOutside'
import { snapshotAndRemoveMember } from '../lib/leaveGroup'
import { loadErrorMessage } from '../lib/loadErrorMessage'
import { getGroupViewPreferences, setGroupViewPreferences } from '../lib/groupViewPreferences'
import ConfirmSheet from './ConfirmSheet'

// The "⋮" per-row menu — same shape as BillActionsMenu.jsx's, just with
// one item so far (see the .row-menu-* rules in styles.css, a copy of
// .bill-menu-*'s under a name that isn't bill-specific). Kept as its own
// tiny component rather than inlined in the list below so open/close state
// and the outside-click handling don't have to be threaded through a loop.
function GroupRowMenu({ onLeave }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  useClickOutside(wrapRef, () => setOpen(false), open)

  return (
    <div className="row-menu-wrap" ref={wrapRef}>
      <button type="button" className="row-menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Group actions">
        ⋮
      </button>
      {open && (
        <div className="row-menu-popover">
          <button
            type="button"
            className="dropdown-item dropdown-item-warn"
            onClick={() => {
              setOpen(false)
              onLeave()
            }}
          >
            Leave group
          </button>
        </div>
      )}
    </div>
  )
}

// Lists every group you're an active member of (the Personal space isn't
// here — it's not something you "leave", it's recreated the moment you
// open that tab again) with a way to leave one directly. GroupSettings'
// own member list already has this exact capability — this is a faster
// path for "which groups am I even in, and I want out of one" without
// opening that group first, not a replacement for it.
export default function SettingsGroupsSection() {
  const { user } = useAuth()
  const [groups, setGroups] = useState(null) // null = still loading
  const [error, setError] = useState(null)
  const [pendingLeave, setPendingLeave] = useState(null) // { id, name, memberId } | null
  const [leaving, setLeaving] = useState(false)
  const [prefs, setPrefs] = useState(getGroupViewPreferences)

  function updatePref(partial) {
    setPrefs(setGroupViewPreferences(partial))
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setError(null)
      const { data: memberRows, error: memberError } = await supabase
        .from('group_members')
        .select('id, group_id')
        .eq('user_id', user.id)
        .eq('active', true)
      if (memberError) {
        if (!cancelled) setError(loadErrorMessage(memberError))
        return
      }

      const memberIdByGroup = new Map((memberRows || []).map((r) => [r.group_id, r.id]))
      const groupIds = [...memberIdByGroup.keys()]
      if (groupIds.length === 0) {
        if (!cancelled) setGroups([])
        return
      }

      const [{ data: groupsData, error: groupsError }, { data: allMembers, error: countError }] = await Promise.all([
        supabase.from('groups').select('id, name, admin_id').in('id', groupIds).eq('is_personal', false),
        supabase.from('group_members').select('group_id').in('group_id', groupIds).eq('active', true),
      ])
      if (groupsError || countError) {
        if (!cancelled) setError(loadErrorMessage(groupsError || countError))
        return
      }

      const countByGroup = new Map()
      for (const row of allMembers || []) {
        countByGroup.set(row.group_id, (countByGroup.get(row.group_id) || 0) + 1)
      }

      const rows = (groupsData || [])
        .map((g) => {
          const memberId = memberIdByGroup.get(g.id)
          return {
            id: g.id,
            name: g.name,
            memberId,
            isAdmin: memberId === g.admin_id,
            memberCount: countByGroup.get(g.id) || 1,
          }
        })
        .sort((a, b) => a.name.localeCompare(b.name))

      if (!cancelled) setGroups(rows)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user.id])

  async function confirmLeave() {
    if (!pendingLeave || leaving) return
    setLeaving(true)
    setError(null)
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('group_id', pendingLeave.id)
      if (categoriesError) throw new Error(categoriesError.message)

      await snapshotAndRemoveMember({
        groupId: pendingLeave.id,
        groupName: pendingLeave.name,
        member: { id: pendingLeave.memberId, userId: user.id },
        categories: categoriesData || [],
      })
      setGroups((gs) => gs.filter((g) => g.id !== pendingLeave.id))
      setPendingLeave(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLeaving(false)
    }
  }

  return (
    <>
      <h2 className="settings-section-title">Display</h2>
      <p className="muted">
        Applies to every group's page alike, not one at a time — if you don't want these, you
        almost certainly don't want them anywhere.
      </p>
      <div className="settings-row">
        <span>Show Quick stats on the group page</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={prefs.showQuickStats}
            onChange={(e) => updatePref({ showQuickStats: e.target.checked })}
            aria-label="Show Quick stats on the group page"
          />
          <span className="switch-slider" />
        </label>
      </div>
      <div className="settings-row">
        <span>Show "You lent/borrowed" on each bill</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={prefs.showLentBorrowedStatus}
            onChange={(e) => updatePref({ showLentBorrowedStatus: e.target.checked })}
            aria-label="Show 'You lent' or 'You borrowed' status on each bill"
          />
          <span className="switch-slider" />
        </label>
      </div>

      <h2 className="settings-section-title">Your groups</h2>
      <p className="muted">
        Leaving a group here does the same thing as Leave in that group's own Settings — this is
        just a faster way to get to it from one place.
      </p>

      {error && <p className="status-error">{error}</p>}

      {groups === null ? (
        <p className="muted">Loading…</p>
      ) : groups.length === 0 ? (
        <p className="empty-state">You're not in any groups yet.</p>
      ) : (
        <ul className="card-list">
          {groups.map((g) => (
            <li key={g.id} className="card-list-item">
              <span className="card-list-item-main">
                <span className="card-list-item-title">
                  {g.name}
                  {g.isAdmin && <span className="role-tag"> (admin)</span>}
                </span>
                <span className="card-list-item-note">
                  {g.memberCount} {g.memberCount === 1 ? 'member' : 'members'}
                </span>
              </span>
              <GroupRowMenu onLeave={() => setPendingLeave(g)} />
            </li>
          ))}
        </ul>
      )}

      {pendingLeave && (
        <ConfirmSheet
          title={`Leave ${pendingLeave.name}?`}
          body="You'll lose access to its bills and balance unless someone invites you back in. Your stats for this group are kept, just frozen as of right now."
          confirmLabel={leaving ? 'Leaving…' : 'Leave'}
          onConfirm={confirmLeave}
          onCancel={() => !leaving && setPendingLeave(null)}
        />
      )}
    </>
  )
}
