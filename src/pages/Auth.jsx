import { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { Card, Button } from '../components/ui.jsx'

export default function Auth() {
  const [mode, setMode] = useState('signin') // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setInfo('Compte créé. Vérifie tes emails pour confirmer ton adresse, puis connecte-toi.')
        setMode('signin')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sidebar-2 to-sidebar-1 font-display text-lg font-semibold text-white">M</div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Marge</h1>
          <p className="text-center text-sm text-ink-500">Organise tes révisions de prépa</p>
        </div>

        <Card className="p-6">
          <div className="mb-5 flex rounded-xl bg-ink-100 p-1">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); setInfo(null) }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${mode === 'signin' ? 'bg-white text-indigo shadow-card' : 'text-ink-500'}`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setInfo(null) }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${mode === 'signup' ? 'bg-white text-indigo shadow-card' : 'text-ink-500'}`}
            >
              Créer un compte
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-600">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-indigo"
                placeholder="toi@exemple.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-600">Mot de passe</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-indigo"
                placeholder="6 caractères minimum"
              />
            </div>

            {error && <p className="text-sm text-coach-600">{error}</p>}
            {info && <p className="text-sm text-indigo">{info}</p>}

            <Button type="submit" disabled={loading} className="mt-1 w-full">
              {loading ? 'Un instant…' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-xs text-ink-400">
          Données de démonstration — Marge MVP
        </p>
      </div>
    </div>
  )
}
