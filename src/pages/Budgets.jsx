import { useNavigate } from 'react-router-dom'
import BudgetsSection from '../components/BudgetsSection'
import BackButton from '../components/BackButton'

// A thin page wrapper around BudgetsSection — the actual UI/logic lives
// there now, shared with its collapsed form on the Settings page. This
// route stays around for the existing deep links straight here (see
// AccountStats.jsx's "Manage budgets →").
export default function Budgets() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <header className="page-header">
        <BackButton onClick={() => navigate(-1)} />
        <h1>Budgets</h1>
      </header>

      <BudgetsSection />
    </div>
  )
}
