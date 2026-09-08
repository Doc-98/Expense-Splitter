import { createLruCache } from './lruCache'

// GroupSubscriptionsSection.jsx's own { members, categories, templates,
// isPersonal }, keyed by group. Capped at 5 groups, same reasoning as
// groupViewCache.js. See prefetchGroupSettings.js for the shared fetch
// this is written from, and GroupView.jsx for where the prefetch actually
// fires. A separate cache from groupCategoriesCache.js/groupRosterCache.js
// despite some overlap in what each underlying query touches — this tab
// uses fetchGroupMembers (active real members only), not
// fetchAllGroupMembers (every member, guests and former members included)
// the roster tab needs, so the two payloads genuinely aren't the same
// shape and shouldn't share a cache entry.
export const groupSubscriptionsCache = createLruCache(5, 'spesa-cache-group-subscriptions-tab')
