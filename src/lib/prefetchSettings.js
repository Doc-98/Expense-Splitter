import { supabase } from '../supabaseClient'
import { loadErrorMessage } from './loadErrorMessage'
import { DEFAULT_CATEGORIES, mergeCategoriesByName } from './categories'
import { fetchThresholds } from './thresholds'
import { settingsGroupsCache, SETTINGS_GROUPS_CACHE_KEY } from './settingsGroupsCache'
import { budgetsCache, BUDGETS_CACHE_KEY } from './budgetsCache'

const DEFAULT_NAME_KEYS = new Set(DEFAULT_CATEGORIES.map((c) => c.name.toLowerCase()))

// The exact rows SettingsGroupsSection.jsx renders — id/name/memberId/
// isAdmin/memberCount — pulled out here so both that component's own load()
// and prefetchSettingsGroups() below (fired the moment the account chip is
// clicked, before Settings.jsx has even mounted — see AppHeader.jsx) share
// one implementation instead of two copies that could quietly drift apart.
export async function fetchSettingsGroupsRows(userId) {
  const { data: memberRows, error: memberError } = await supabase
    .from('group_members')
    .select('id, group_id')
    .eq('user_id', userId)
    .eq('active', true)
  if (memberError) throw new Error(loadErrorMessage(memberError))

  const memberIdByGroup = new Map((memberRows || []).map((r) => [r.group_id, r.id]))
  const groupIds = [...memberIdByGroup.keys()]
  if (groupIds.length === 0) return []

  const [{ data: groupsData, error: groupsError }, { data: allMembers, error: countError }] = await Promise.all([
    supabase.from('groups').select('id, name, admin_id').in('id', groupIds).eq('is_personal', false),
    supabase.from('group_members').select('group_id').in('group_id', groupIds).eq('active', true),
  ])
  if (groupsError || countError) throw new Error(loadErrorMessage(groupsError || countError))

  const countByGroup = new Map()
  for (const row of allMembers || []) {
    countByGroup.set(row.group_id, (countByGroup.get(row.group_id) || 0) + 1)
  }

  return (groupsData || [])
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
}

// Same idea for BudgetsSection.jsx — its own customCategories/
// thresholdByKey, computed once here.
export async function fetchBudgetsData(userId) {
  const { data: memberRows, error: memberError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)
    .eq('active', true)
  if (memberError) throw new Error(loadErrorMessage(memberError))
  const groupIds = [...new Set((memberRows || []).map((r) => r.group_id))]

  const { data: categoriesData, error: categoriesError } = groupIds.length
    ? await supabase.from('categories').select('name, color').in('group_id', groupIds).order('created_at', { ascending: true })
    : { data: [], error: null }
  if (categoriesError) throw new Error(loadErrorMessage(categoriesError))

  const merged = mergeCategoriesByName(categoriesData || [])
  const customCategories = merged
    .filter((c) => !DEFAULT_NAME_KEYS.has(c.name.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  const thresholds = await fetchThresholds(userId)
  const thresholdByKey = new Map(thresholds.map((t) => [t.category_name.trim().toLowerCase(), t]))

  return { customCategories, thresholdByKey }
}

// Fired the instant the account chip is clicked (see AppHeader.jsx) — not
// awaited there, just kicked off ahead of the navigation so Settings.jsx's
// Groups/Budgets sections (the two that hit the database — see each
// section's own comment) can paint from cache instantly instead of
// spending the click-to-paint gap on a fetch that could have started
// sooner. Same "warm it before it's needed, quietly overwrite once real
// data resolves" idea as prefetchGroup.js, just triggered by a click
// rather than a page load. Best-effort throughout: a failure here is
// swallowed rather than surfaced, since the section's own load() pays the
// normal fetch cost regardless if this didn't finish (or didn't run) in
// time — nothing is worse off than before this existed.
export function prefetchSettingsGroups(userId) {
  if (!userId || settingsGroupsCache.get(SETTINGS_GROUPS_CACHE_KEY)) return
  fetchSettingsGroupsRows(userId)
    .then((rows) => settingsGroupsCache.set(SETTINGS_GROUPS_CACHE_KEY, rows))
    .catch(() => {})
}

export function prefetchBudgets(userId) {
  if (!userId || budgetsCache.get(BUDGETS_CACHE_KEY)) return
  fetchBudgetsData(userId)
    .then((data) => budgetsCache.set(BUDGETS_CACHE_KEY, data))
    .catch(() => {})
}
