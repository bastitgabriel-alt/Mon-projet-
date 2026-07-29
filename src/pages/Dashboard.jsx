import { useMemo } from 'react'
import { subjects, subjectProgress, weekEvents, eventTypeLabels, moodOptions } from '../data/mockData.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { Card, SectionTitle, ProgressBar, Badge, Button } from '../components/ui.jsx'
import { ScanIcon, CardsIcon, CheckIcon } from '../components/icons.jsx'

const todayKey = new Date().toISOString().slice(0, 10)

export default function Dashboard({ onNavigate }) {
  const [mood, setMood] = useLocalStorage(`marge_mood_${todayKey}`, null)

  const upcoming = useMemo(
    () => weekEvents.filter((e) => !e.done).slice(0, 4),
    []
  )
  const doneCount = weekEvents.filter((e) => e.done).length

  const selectedMood = moodOptions.find((m) => m.id === mood)

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm text-ink-500">Semaine du 28 juillet au 3 août</p>
        <h1 className="text-2xl font-bold text-ink-900">Salut ! Voici ton point de la semaine.</h1>
      </header>

      {/* Charge mentale */}
      <Card className="p-5">
        <SectionTitle title="Comment tu te sens aujourd'hui ?" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {moodOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setMood(opt.id)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                mood === opt.id
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-ink-200 text-ink-600 hover:border-brand-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {selectedMood && (
          <p className="mt-3 text-sm text-ink-500">{selectedMood.hint}</p>
        )}
      </Card>

      {/* Accès rapide */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('scan')}
          className="flex items-center gap-3 rounded-2xl bg-brand-600 p-4 text-left text-white shadow-soft hover:bg-brand-700 transition-colors"
        >
          <ScanIcon className="w-7 h-7" />
          <span className="text-sm font-semibold leading-tight">Scanner<br />une copie</span>
        </button>
        <button
          onClick={() => onNavigate('fiches')}
          className="flex items-center gap-3 rounded-2xl bg-white border border-ink-100 p-4 text-left text-ink-800 shadow-card hover:bg-ink-50 transition-colors"
        >
          <CardsIcon className="w-7 h-7 text-brand-600" />
          <span className="text-sm font-semibold leading-tight">Mes fiches<br />de révision</span>
        </button>
      </div>

      {/* Emploi du temps / échéances */}
      <div>
        <SectionTitle
          eyebrow={`${doneCount} déjà fait cette semaine`}
          title="À venir cette semaine"
        />
        <div className="flex flex-col gap-2">
          {upcoming.map((ev) => {
            const subject = subjects.find((s) => s.id === ev.subjectId)
            const typeInfo = eventTypeLabels[ev.type]
            return (
              <Card key={ev.id} className="flex items-center gap-3 p-3.5">
                <span className={`h-9 w-1.5 rounded-full ${subject?.accent || 'bg-ink-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800">{ev.title}</p>
                  <p className="text-xs text-ink-500">{ev.day} {ev.date} · {ev.time} · {subject?.short}</p>
                </div>
                <Badge className={typeInfo.badge}>{typeInfo.label}</Badge>
              </Card>
            )
          })}
          {upcoming.length === 0 && (
            <Card className="p-4 text-center text-sm text-ink-500">
              Rien de prévu pour l'instant, profites-en pour avancer une fiche.
            </Card>
          )}
        </div>
      </div>

      {/* Progression par matière */}
      <div>
        <SectionTitle title="Ta progression par matière" />
        <Card className="p-5 flex flex-col gap-4">
          {subjects.map((s) => (
            <div key={s.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-ink-700">{s.name}</span>
                <span className="text-ink-500">{subjectProgress[s.id]}%</span>
              </div>
              <ProgressBar value={subjectProgress[s.id]} colorClass={s.accent} />
            </div>
          ))}
        </Card>
      </div>

      <p className="flex items-center gap-2 text-xs text-ink-400 justify-center pb-2">
        <CheckIcon className="w-4 h-4" /> Données de démonstration — Marge MVP
      </p>
    </div>
  )
}
