import { Link } from 'react-router-dom'
import { BackArrowIcon } from './icons'

// The single "go back" control every page's header uses, replacing what
// used to be 14 separate "← Back"/"← Groups" text links — a `to` prop
// renders a Link to a fixed destination (most pages); omit it and pass
// `onClick` instead for a page that goes back to wherever the browser
// history actually came from (navigate(-1), same as the back button
// itself would do). `label` defaults to the generic "Back" but a few
// callers (GroupView, AccountStats — both go to a named destination, not
// "whatever's one level up") pass something more specific, same idea as
// the Share/Stats/Settings icons' own aria-labels.
export default function BackButton({ to, onClick, label = 'Back' }) {
  if (to) {
    return (
      <Link to={to} className="icon-btn" aria-label={label} title={label}>
        <BackArrowIcon />
      </Link>
    )
  }
  return (
    <button type="button" className="icon-btn" onClick={onClick} aria-label={label} title={label}>
      <BackArrowIcon />
    </button>
  )
}
