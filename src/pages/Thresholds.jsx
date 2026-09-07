import { useNavigate } from 'react-router-dom'
import ThresholdsSection from '../components/ThresholdsSection'
import BackButton from '../components/BackButton'

// A thin page wrapper around ThresholdsSection — the actual UI/logic lives
// there now, shared with its collapsed form on the Settings page. This
// route stays around for the existing deep links straight here (see
// AccountStats.jsx's "Manage thresholds →").
export default function Thresholds() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <header className="page-header">
        <BackButton onClick={() => navigate(-1)} />
        <h1>Spending thresholds</h1>
      </header>

      <ThresholdsSection />
    </div>
  )
}
