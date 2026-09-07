import { useNavigate } from 'react-router-dom'
import AboutSection from '../components/AboutSection'
import BackButton from '../components/BackButton'

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <header className="page-header">
        <BackButton onClick={() => navigate(-1)} />
        <h1>About</h1>
      </header>

      <AboutSection />
    </div>
  )
}
