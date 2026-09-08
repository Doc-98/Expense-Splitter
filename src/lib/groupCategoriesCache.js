import { createLruCache } from './lruCache'

// GroupCategoriesSection.jsx's own list, keyed by group. Capped at 5
// groups, same reasoning as groupViewCache.js. See prefetchGroupSettings.js
// for the shared fetch this is written from, and GroupView.jsx for where
// the prefetch actually fires.
export const groupCategoriesCache = createLruCache(5, 'spesa-cache-group-categories-tab')
