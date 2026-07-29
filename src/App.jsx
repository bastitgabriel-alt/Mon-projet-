import { useEffect, useState } from 'react'
import Nav from './components/Nav.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Scan from './pages/Scan.jsx'
import Fiches from './pages/Fiches.jsx'
import AuthPage from './pages/Auth.jsx'
import { AuthProvider, useAuth } from './lib/AuthContext.jsx'
import { seedDemoDataIfNeeded } from './lib/seedDemoData.js'

function AppShell() {
  const { session, signOut } = useAuth()
  const [page, setPage] = useState('dashboard')
  // Permet à une page (ex: Dashboard) de naviguer vers un autre onglet avec un contexte,
  // par exemple ouvrir directement une fiche précise depuis l'accueil.
  const [navParams, setNavParams] = useState(null)

  const navigate = (target, params = null) => {
    setPage(target)
    setNavParams(params)
  }

  useEffect(() => {
    if (session?.user) seedDemoDataIfNeeded(session.user.id)
  }, [session?.user?.id])

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-400">
        Chargement…
      </div>
    )
  }

  if (!session) return <AuthPage />

  return (
    <div className="min-h-screen bg-ink-50 md:pl-56">
      <Nav current={page} onNavigate={navigate} />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-6 md:pb-10 md:pt-8">
        {page === 'dashboard' && <Dashboard onNavigate={navigate} userId={session.user.id} onSignOut={signOut} />}
        {page === 'scan' && <Scan navParams={navParams} userId={session.user.id} />}
        {page === 'fiches' && <Fiches navParams={navParams} userId={session.user.id} />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
