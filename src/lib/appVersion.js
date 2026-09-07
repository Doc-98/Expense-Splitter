// Bumped by hand with each PR — "1.<PR number>" rather than semver, since
// PRs merge in order on this branch and are already a visible, monotonic
// counter of what's shipped (cross-referenceable against GitHub directly).
// No CI wires this automatically, so it's on whoever opens the next PR to
// bump it. Read by AppHeader.jsx's brand chip and by the Settings > Updates
// section — one source of truth for both.
export const APP_VERSION = 'v1.41'

// A short, synthetic recap of what changed in APP_VERSION specifically —
// not a full changelog (that's what git history/GitHub is for), just
// enough for "what's new" on the Updates section. Replace this list (and
// bump APP_VERSION above) with each PR.
export const WHATS_NEW = [
  'New Settings page — profile, groups, budgets, scan, and more, all in one place with a side menu',
  "Renamed \"Spending thresholds\" to \"Budgets\" throughout the app",
  'Sign-out and leave-group confirmations now use a bottom sheet',
  'A prompt to add Spesa to your home screen, the first time you open it in a browser',
]
