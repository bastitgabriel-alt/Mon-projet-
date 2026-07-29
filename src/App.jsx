import { useEffect, useState } from 'react'
import Nav from './components/Nav.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Scan from './pages/Scan.jsx'
import Fiches from './pages/Fiches.jsx'
import ColleIA from './pages/ColleIA.jsx'
import Mental from './pages/Mental.jsx'
import AuthPage from './pages/Auth.jsx'
import { AuthProvider, useAuth } from './lib/AuthContext.jsx'
import { seedDemoDataIfNeeded } from './lib/seedDemoData.js'

const pageMeta = {
  dashboard: { title: 'Tableau de bord', subtitle: null },
  scan: { title: 'Copies', subtitle: 'Scanne une copie annotée, suis tes erreurs récurrentes' },
  fiches: { title: 'Fiches', subtitle: 'Tes fiches de révision, générées ou personnelles' },
  colle: { title: 'Colle IA', subtitle: "Entraîne-toi à l'oral face à un colleur virtuel" },
  mental: { title: 'Mental', subtitle: 'Ton accompagnement au quotidien, sur la durée' }
}

function todayLabel() {
  const label = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

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

  const meta = pageMeta[page]

  return (
    <div className="flex min-h-screen flex-col bg-canvas md:flex-row">
      <Nav current={page} onNavigate={navigate} userEmail={session.user.email} onSignOut={signOut} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-9 md:py-[22px]">
          <div>
            <h1 className="font-display text-[18px] md:text-[20px] font-semibold text-ink-900">{meta.title}</h1>
            <p className="text-xs md:text-[12.5px] text-ink-500 mt-0.5">{meta.subtitle || todayLabel()}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-[10px] border border-ink-200 bg-white px-3 py-2 text-[12.5px] text-ink-400 min-w-[180px]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              Rechercher…
            </div>
            <button onClick={signOut} className="shrink-0 text-xs font-medium text-ink-400 hover:text-ink-600 md:hidden">
              Déconnexion
            </button>
          </div>
        </div>

        <main className="px-5 pb-10 md:px-9 md:pb-[60px]">
          {page === 'dashboard' && (
            <Dashboard onNavigate={navigate} userId={session.user.id} userEmail={session.user.email} />
          )}
          {page === 'scan' && <Scan navParams={navParams} userId={session.user.id} />}
          {page === 'fiches' && <Fiches navParams={navParams} userId={session.user.id} />}
          {page === 'colle' && <ColleIA userId={session.user.id} />}
          {page === 'mental' && <Mental userId={session.user.id} />}
        </main>
      </div>
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
