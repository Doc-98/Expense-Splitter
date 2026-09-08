// Small, hand-drawn icon set — plain inline SVG rather than an icon-font
// or component library dependency, since this app only ever needs a
// handful of them (adding a whole library for 4-5 glyphs would cost far
// more bundle size than it saves in code). Each icon is stroke-based,
// sized via a `size` prop (default 20, matching most inline-with-text
// use), and colored via `currentColor` so it inherits whatever color its
// button/link already has — no separate light/dark theming needed. Every
// icon is `aria-hidden` by default, since it always sits inside a button
// or link that already carries its own accessible label (an `aria-label`,
// or visible text next to it) — the icon is decoration, not the label
// itself.
//
// Kept in one file rather than one-file-per-icon: this small a set is
// easier to scan and keep visually consistent (same stroke width, same
// viewBox) side by side than spread across several files.

export function SearchIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <line x1="16.2" y1="16.2" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// The three-node "Android-style" share glyph — the more platform-neutral
// of the two common "share" icons (the other being the iOS box-with-an-
// arrow-out-the-top), and the one more people would immediately read as
// "share" outside of iOS specifically.
export function ShareIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="6" cy="12" r="2.6" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="5.5" r="2.6" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="18.5" r="2.6" stroke="currentColor" strokeWidth="2" />
      <line x1="8.3" y1="10.8" x2="15.7" y2="6.7" stroke="currentColor" strokeWidth="2" />
      <line x1="8.3" y1="13.2" x2="15.7" y2="17.3" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export function SettingsIcon({ size = 20, ...props }) {
  const teeth = Array.from({ length: 8 }, (_, i) => i * 45)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {teeth.map((deg) => (
        <rect key={deg} x="11" y="1" width="2" height="3.6" rx="0.6" fill="currentColor" transform={`rotate(${deg} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="7.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export function PieChartIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 12V3a9 9 0 019 9h-9z" fill="currentColor" opacity="0.35" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 3v9h9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

// Replaces "See graphs →" (both stats pages) with an icon-only button,
// matching the Share/Stats/Settings convention. A filled area under the
// trend line rather than a bare line — echoes PieChartIcon's own
// shaded-wedge treatment above, so the two read as one family of "stats"
// icons rather than two unrelated glyphs picked separately.
export function LineChartIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M3 17l5-6 4 3 8-9v13H3z" fill="currentColor" opacity="0.3" />
      <path d="M3 17l5-6 4 3 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// The single "go back" glyph — replaces every "← Back"/"← Groups" text
// link across the app (see BackButton.jsx, which wraps this in the same
// .icon-btn treatment the header's Share/Stats/Settings icons already
// use). A full shaft-plus-arrowhead rather than a bare chevron — matches
// the visual weight of those other icons (all comparable stroke coverage),
// so it reads clearly on its own without needing top-left position to
// disambiguate it from, say, a collapse toggle.
export function BackArrowIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// The plain three-bar "hamburger" — toggles the Settings page's own side
// nav open/closed (see SettingsNav.jsx). Not reused for anything else; the
// account menu this used to open no longer exists (see AppHeader.jsx).
export function MenuIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ---------- Settings nav icons ----------
// One glyph per section in SettingsNav.jsx — grouped here together since
// they only ever appear side by side in that one rail, and share a
// slightly lighter visual weight (opacity-based fills instead of solid
// ones) than the header's own Share/Stats/Settings icons above, so a full
// column of them doesn't compete with the section content next to it.

export function ProfileIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="2" />
      <path d="M4.5 20c0-3.9 3.4-6.8 7.5-6.8s7.5 2.9 7.5 6.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function GroupsNavIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="9" cy="8.5" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 19.2c0-3.2 2.7-5.6 6-5.6s6 2.4 6 5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17.3" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.6" opacity="0.55" />
      <path d="M15 13.6c2.4.5 4.2 2.4 4.6 4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
    </svg>
  )
}

// Bars with a dashed cap line — spending (the bars) measured against a
// budget (the line), rather than a generic wallet/coin glyph that says
// "money" without saying "a limit on money."
export function BudgetIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M3 4h18" stroke="currentColor" strokeWidth="1.6" strokeDasharray="1 3" strokeLinecap="round" />
      <rect x="4" y="15" width="5" height="6" rx="1" fill="currentColor" opacity="0.35" />
      <rect x="10.5" y="9" width="5" height="12" rx="1" fill="currentColor" />
      <rect x="17" y="12" width="5" height="9" rx="1" fill="currentColor" opacity="0.35" />
    </svg>
  )
}

export function ScanIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2.5" y="7" width="19" height="13" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M8 7l1.4-2.4h5.2L16 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="13.6" r="3.6" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export function GuideIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 6.2c-1.9-1.4-4.6-1.8-7-1.2v13.4c2.4-.6 5.1-.2 7 1.2 1.9-1.4 4.6-1.8 7-1.2V5c-2.4-.6-5.1-.2-7 1.2z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 6.2v13.4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function UpdatesIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M20 12a8 8 0 10-2.7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20.5 6.5V12h-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AboutIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="8.3" r="1.15" fill="currentColor" />
      <path d="M12 11.3v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function SignOutIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M9 4H6.5a2 2 0 00-2 2v12a2 2 0 002 2H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 12H9.5M15.5 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
