import { createLruCache } from './lruCache'

// Shared by GroupMembersSection.jsx and GroupGuestsSection.jsx — both run
// the exact same underlying query (fetchAllGroupMembers, plus the group's
// own name/admin_id), Members just also needs invite_code. Capped at 5
// groups, same reasoning as groupViewCache.js — someone bouncing between a
// few groups' settings in one session shouldn't accumulate an ever-growing
// cache. See prefetchGroupSettings.js for the shared fetch this is written
// from, and GroupView.jsx for where the prefetch actually fires.
export const groupRosterCache = createLruCache(5, 'spesa-cache-group-roster')
