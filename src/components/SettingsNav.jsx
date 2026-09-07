import { SignOutIcon } from './icons'

// The Settings page's own side nav — an icon-only rail by default
// (`expanded` false), showing labels once the header's hamburger button
// expands it (see Settings.jsx). Never fully disappears: even collapsed,
// every section stays one tap away rather than needing the rail reopened
// first, which is the point of it staying a rail instead of a drawer that
// closes over the content.
//
// Sign Out sits below a spacer, split off by its own top border and the
// app's existing "warning" color — it's an action, not a section, so nav's
// active-highlight treatment intentionally never applies to it.
export default function SettingsNav({ sections, activeId, onSelect, onSignOut }) {
  return (
    <nav className="settings-nav">
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`nav-item${s.id === activeId ? ' active' : ''}`}
          onClick={() => onSelect(s.id)}
          title={s.label}
        >
          <s.Icon size={18} />
          <span className="label">{s.label}</span>
        </button>
      ))}
      <div className="nav-spacer" />
      <button type="button" className="nav-item signout" onClick={onSignOut} title="Sign Out">
        <SignOutIcon size={18} />
        <span className="label">Sign Out</span>
      </button>
    </nav>
  )
}
