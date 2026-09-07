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
