import { createLruCache } from './lruCache'

// Settings → Budgets never had a cache of its own before — same gap
// groupsListCache.js closed for the groups list. One entry (the signed-in
// account's own budgets), fixed key. See prefetchSettings.js for the
// shared fetch this is written from, and AppHeader.jsx for where the
// prefetch actually fires. The cached payload holds a real Map
// (thresholdByKey) — createLruCache's sessionStorage mirroring already
// round-trips Map/Set correctly (see lruCache.js), same as any other
// cache here.
export const budgetsCache = createLruCache(1, 'spesa-cache-budgets')
export const BUDGETS_CACHE_KEY = 'mine'
