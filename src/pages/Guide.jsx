import { useNavigate } from 'react-router-dom'
import GuideSection from '../components/GuideSection'
import BackButton from '../components/BackButton'

export default function Guide() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <header className="page-header">
        <BackButton onClick={() => navigate(-1)} />
        <h1>How to use Spesa</h1>
      </header>

      <GuideSection />
    </div>
  )
}
