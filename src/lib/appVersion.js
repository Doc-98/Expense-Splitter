// "1.<PR number>" rather than semver, since PRs merge in order on this
// branch and are already a visible, monotonic counter of what's shipped
// (cross-referenceable against GitHub directly). Computed automatically at
// build time (see vite.config.js) from the latest squash-merge commit's
// message — every PR here is squash-merged, and GitHub always appends
// " (#123)" to that commit's own subject, so there's nothing left to bump
// by hand or for it to drift out of sync with. Read by AppHeader.jsx's
// brand chip and by the Settings > Updates section — one source of truth
// for both.
export const APP_VERSION = import.meta.env.VITE_APP_VERSION

// A short, synthetic recap of what changed in the current APP_VERSION —
// not a full changelog (that's what git history/GitHub is for), just
// enough for "what's new" on the Updates section. Unlike APP_VERSION
// itself, this stays editorial and hand-maintained (there's no reliable
// way to summarize "what a human would care about" from a commit message
// alone) — replace this list with each PR that ships something visible.
export const WHATS_NEW = [
  'Redesigned Group Settings with a side rail, loading instantly from cache while it refreshes in the background',
  'Scan a receipt: choose between taking a photo or picking a file (PDF, TXT, HTML also supported)',
  'Price fields now accept simple math expressions (e.g. "2,30-1,25"), and iPhone shows a minus key on the numeric keypad',
  'New "Sticky Filters" setting to keep bill filters active as you move between pages',
  'Revamped How to Use guide — easier navigation and shorter, more visual sections',
]
