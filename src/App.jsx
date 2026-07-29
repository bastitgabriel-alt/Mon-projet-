import { useState } from 'react'
import Nav from './components/Nav.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Scan from './pages/Scan.jsx'
import Fiches from './pages/Fiches.jsx'

export default function App() {
  const [page, setPage] = useState('dashboard')
  // Permet à une page (ex: Dashboard) de naviguer vers un autre onglet avec un contexte,
  // par exemple ouvrir directement une fiche précise depuis l'accueil.
  const [navParams, setNavParams] = useState(null)

  const navigate = (target, params = null) => {
    setPage(target)
    setNavParams(params)
  }

  return (
    <div className="min-h-screen bg-ink-50 md:pl-56">
      <Nav current={page} onNavigate={navigate} />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-6 md:pb-10 md:pt-8">
        {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {page === 'scan' && <Scan navParams={navParams} />}
        {page === 'fiches' && <Fiches navParams={navParams} />}
      </main>
    </div>
  )
}
