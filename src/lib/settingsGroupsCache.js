import { createLruCache } from './lruCache'

// Settings → Groups never had a cache of its own before — every visit
// refetched from nothing, same gap groupsListCache.js closed for the
// groups list itself. Only one relevant entry (the signed-in account's
// own rows), so a fixed key is enough. See prefetchSettings.js for the
// shared fetch this is written from, and AppHeader.jsx for where the
// prefetch actually fires.
export const settingsGroupsCache = createLruCache(1, 'spesa-cache-settings-groups')
export const SETTINGS_GROUPS_CACHE_KEY = 'mine'
