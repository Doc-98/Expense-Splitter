import { supabase } from '../supabaseClient'
import { fetchAllGroupMembers, fetchGroupMembers } from './members'
import { fetchCategories } from './categories'
import { fetchRecurringBills } from './recurringBills'
import { groupRosterCache } from './groupRosterCache'
import { groupCategoriesCache } from './groupCategoriesCache'
import { groupSubscriptionsCache } from './groupSubscriptionsCache'

// The exact payload GroupMembersSection.jsx/GroupGuestsSection.jsx each
// render — one shared fetch since both run the identical underlying query
// (Members just also uses invite_code) — see groupRosterCache.js's own
// comment for why that's one cache entry, not two.
export async function fetchGroupRosterData(groupId) {
  const [{ data: group }, members] = await Promise.all([
    supabase.from('groups').select('name, admin_id, invite_code').eq('id', groupId).single(),
    fetchAllGroupMembers(groupId),
  ])
  return {
    name: group?.name || '',
    adminId: group?.admin_id || null,
    inviteCode: group?.invite_code || '',
    members,
  }
}

// GroupSubscriptionsSection.jsx's own load() shape.
export async function fetchGroupSubscriptionsData(groupId) {
  const [members, categories, templates, { data: group }] = await Promise.all([
    fetchGroupMembers(groupId),
    fetchCategories(groupId),
    fetchRecurringBills(supabase, groupId),
    supabase.from('groups').select('is_personal').eq('id', groupId).single(),
  ])
  return { members, categories, templates, isPersonal: group?.is_personal || false }
}

// Fired the instant the group page's own Settings (gear) icon is clicked
// (see GroupView.jsx) — not awaited, just kicked off ahead of the
// navigation so Members/Guests/Categories/Subscriptions (the four Group
// Settings tabs that hit the database) can paint from cache instantly
// instead of spending the click-to-paint gap on a fetch that could have
// started sooner. Same idea as prefetchSettings.js, just for the group
// page's own gear icon instead of the account chip. Best-effort
// throughout — a failure here is swallowed, since each tab's own load()
// pays the normal fetch cost regardless if this didn't finish (or didn't
// run) in time.
export function prefetchGroupSettings(groupId) {
  if (!groupId) return

  if (!groupRosterCache.get(groupId)) {
    fetchGroupRosterData(groupId)
      .then((data) => groupRosterCache.set(groupId, data))
      .catch(() => {})
  }
  if (!groupCategoriesCache.get(groupId)) {
    fetchCategories(groupId)
      .then((categories) => groupCategoriesCache.set(groupId, categories))
      .catch(() => {})
  }
  if (!groupSubscriptionsCache.get(groupId)) {
    fetchGroupSubscriptionsData(groupId)
      .then((data) => groupSubscriptionsCache.set(groupId, data))
      .catch(() => {})
  }
}
