import { useEffect, useRef, useState } from 'react'
import {
  subjects,
  scans,
  errorCategories,
  generateScanResult,
  computeErrorGroups,
  computeWeeklySynthesis
} from '../data/mockData.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { Card, SectionTitle, Badge, Button } from '../components/ui.jsx'
import AnnotatedCopy from '../components/AnnotatedCopy.jsx'
import { CameraIcon, UploadIcon, ChevronLeftIcon, SparkleIcon, CheckIcon } from '../components/icons.jsx'
import { styleFor } from '../utils/categoryStyles.js'

const ANALYZE_STEPS = [
  "Lecture de la copie…",
  "Extraction des annotations du prof…",
  "Regroupement des erreurs récurrentes…",
  "Génération de ta synthèse…"
]

export default function Scan() {
  const [step, setStep] = useState('idle') // idle | preview | analyzing | result | history
  const [subjectId, setSubjectId] = useState('maths')
  const [imageUrl, setImageUrl] = useState(null)
  const [analyzeStep, setAnalyzeStep] = useState(0)
  const [newScan, setNewScan] = useState(null)
  const [activeAnnotation, setActiveAnnotation] = useState(null)
  const [historyScan, setHistoryScan] = useState(null)
  const [createdFicheKeys, setCreatedFicheKeys] = useState([])
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const [customScans, setCustomScans] = useLocalStorage('marge_custom_scans', [])
  const [, setCustomFiches] = useLocalStorage('marge_custom_fiches', [])

  const allScans = [...customScans, ...scans]

  useEffect(() => {
    if (step !== 'analyzing') return
    if (analyzeStep >= ANALYZE_STEPS.length) {
      const subject = subjects.find((s) => s.id === subjectId)
      const result = generateScanResult(subjectId, `Copie du ${new Date().toLocaleDateString('fr-FR')} — ${subject?.name}`)
      setNewScan(result)
      setCustomScans((prev) => [result, ...prev])
      setStep('result')
      return
    }
    const t = setTimeout(() => setAnalyzeStep((s) => s + 1), 650)
    return () => clearTimeout(t)
  }, [step, analyzeStep, subjectId, setCustomScans])

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUrl(URL.createObjectURL(file))
    setStep('preview')
  }

  function startAnalysis() {
    setAnalyzeStep(0)
    setStep('analyzing')
  }

  function reset() {
    setStep('idle')
    setImageUrl(null)
    setNewScan(null)
    setActiveAnnotation(null)
    setAnalyzeStep(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  function createFiche(group) {
    const subject = subjects.find((s) => s.id === group.subjectId)
    const category = errorCategories[group.category]
    setCustomFiches((prev) => [
      {
        id: `fiche-${Date.now()}`,
        subjectId: group.subjectId,
        title: `${category.label} en ${subject?.short}`,
        lastReviewed: null,
        linkedCategory: group.category,
        generated: true,
        summary: category.tip
      },
      ...prev
    ])
    setCreatedFicheKeys((prev) => [...prev, group.key])
  }

  if (step === 'history' && historyScan) {
    const subject = subjects.find((s) => s.id === historyScan.subjectId)
    return (
      <div className="flex flex-col gap-4">
        <BackButton onClick={() => setStep('idle')} label="Historique" />
        <div>
          <h1 className="text-xl font-bold text-ink-900">{historyScan.title}</h1>
          <p className="text-sm text-ink-500">{subject?.name} · {historyScan.date}{historyScan.grade ? ` · ${historyScan.grade}` : ''}</p>
        </div>
        <AnnotatedCopy
          imageUrl={null}
          annotations={historyScan.annotations}
          activeId={activeAnnotation}
          onSelect={setActiveAnnotation}
        />
        <AnnotationList annotations={historyScan.annotations} activeId={activeAnnotation} onSelect={setActiveAnnotation} />
      </div>
    )
  }

  if (step === 'preview') {
    return (
      <div className="flex flex-col gap-4">
        <BackButton onClick={reset} label="Annuler" />
        <h1 className="text-xl font-bold text-ink-900">Vérifie ta copie</h1>
        <AnnotatedCopy imageUrl={imageUrl} annotations={[]} />
        <Card className="p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink-700">Matière</p>
            <p className="text-xs text-ink-500">Choisis la matière pour affiner l'analyse</p>
          </div>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Card>
        <Button onClick={startAnalysis} className="w-full">
          <SparkleIcon /> Lancer l'analyse
        </Button>
      </div>
    )
  }

  if (step === 'analyzing') {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold text-ink-900">Analyse en cours…</h1>
        <AnnotatedCopy imageUrl={imageUrl} annotations={[]} />
        <Card className="p-5">
          <ul className="flex flex-col gap-3">
            {ANALYZE_STEPS.map((label, i) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    i < analyzeStep ? 'bg-brand-600 text-white' : i === analyzeStep ? 'bg-brand-100 text-brand-700 animate-pulse' : 'bg-ink-100 text-ink-400'
                  }`}
                >
                  {i < analyzeStep ? <CheckIcon className="w-3.5 h-3.5" /> : i + 1}
                </span>
                <span className={i <= analyzeStep ? 'text-ink-700' : 'text-ink-400'}>{label}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    )
  }

  if (step === 'result' && newScan) {
    const subject = subjects.find((s) => s.id === newScan.subjectId)
    const relevantScans = allScans.filter((s) => s.subjectId === newScan.subjectId)
    const recurring = computeErrorGroups(relevantScans).filter((g) => g.count > 1)
    const synthesis = computeWeeklySynthesis(allScans)

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-brand-700">
          <CheckIcon className="w-5 h-5" />
          <span className="text-sm font-semibold">Analyse terminée</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink-900">{newScan.title}</h1>
          <p className="text-sm text-ink-500">{subject?.name} · {newScan.date}</p>
        </div>

        <AnnotatedCopy
          imageUrl={imageUrl}
          annotations={newScan.annotations}
          activeId={activeAnnotation}
          onSelect={setActiveAnnotation}
        />

        <div>
          <SectionTitle title="Annotations détectées" eyebrow={`${newScan.annotations.length} repérées`} />
          <AnnotationList annotations={newScan.annotations} activeId={activeAnnotation} onSelect={setActiveAnnotation} />
        </div>

        {recurring.length > 0 && (
          <div>
            <SectionTitle title="Erreurs qui reviennent souvent" eyebrow={subject?.name} />
            <div className="flex flex-col gap-2">
              {recurring.map((g) => (
                <Card key={g.key} className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink-800">{errorCategories[g.category].label}</span>
                    <Badge className={styleFor(g.category).badge}>vu {g.count} fois</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-500">{errorCategories[g.category].tip}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <SectionTitle title="Tes 3 points à travailler cette semaine" eyebrow="Synthèse actionnable" />
          <div className="flex flex-col gap-2">
            {synthesis.map((g, i) => {
              const subj = subjects.find((s) => s.id === g.subjectId)
              const created = createdFicheKeys.includes(g.key)
              return (
                <Card key={g.key} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-brand-600">Priorité {i + 1} · {subj?.short}</p>
                      <p className="text-sm font-semibold text-ink-800">{errorCategories[g.category].label}</p>
                      <p className="mt-1 text-xs text-ink-500">{errorCategories[g.category].tip}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    {created ? (
                      <Badge className="bg-brand-50 text-brand-700"><CheckIcon className="w-3.5 h-3.5 mr-1" /> Fiche créée</Badge>
                    ) : (
                      <Button variant="secondary" onClick={() => createFiche(g)} className="text-xs px-3 py-1.5">
                        Créer une fiche de révision
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <Button variant="ghost" onClick={reset} className="w-full border border-ink-200">
          Nouveau scan
        </Button>
      </div>
    )
  }

  // step === 'idle'
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-ink-900">Scan de copie</h1>
        <p className="text-sm text-ink-500">Photographie ta copie annotée pour repérer ce qu'il faut travailler.</p>
      </header>

      <Card className="p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-700">Matière de la copie</p>
        </div>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-2xl bg-brand-600 p-6 text-white shadow-soft hover:bg-brand-700 transition-colors"
        >
          <CameraIcon className="w-8 h-8" />
          <span className="text-sm font-semibold">Prendre en photo</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-ink-100 p-6 text-ink-800 shadow-card hover:bg-ink-50 transition-colors"
        >
          <UploadIcon className="w-8 h-8 text-brand-600" />
          <span className="text-sm font-semibold">Importer un fichier</span>
        </button>
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      <div>
        <SectionTitle title="Historique de tes scans" />
        <div className="flex flex-col gap-2">
          {allScans.map((s) => {
            const subject = subjects.find((sub) => sub.id === s.subjectId)
            return (
              <button
                key={s.id}
                onClick={() => { setHistoryScan(s); setActiveAnnotation(null); setStep('history') }}
                className="text-left"
              >
                <Card className="flex items-center gap-3 p-3.5 hover:bg-ink-50 transition-colors">
                  <span className={`h-9 w-1.5 rounded-full ${subject?.accent || 'bg-ink-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-ink-800">{s.title}</p>
                    <p className="text-xs text-ink-500">{subject?.name} · {s.date}{s.grade ? ` · ${s.grade}` : ''}</p>
                  </div>
                  <Badge className="bg-ink-100 text-ink-600">{s.annotations.length} annotations</Badge>
                </Card>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AnnotationList({ annotations, activeId, onSelect }) {
  return (
    <div className="flex flex-col gap-2">
      {annotations.map((ann, i) => {
        const style = styleFor(ann.category)
        const active = activeId === ann.id
        return (
          <button key={ann.id} onClick={() => onSelect?.(ann.id)} className="text-left">
            <Card className={`flex items-start gap-3 p-3.5 transition-shadow ${active ? `ring-2 ${style.ring}` : ''}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${style.dot}`}>
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm text-ink-700">{ann.comment}</p>
                <Badge className={`mt-1.5 ${style.badge}`}>{errorCategories[ann.category].label}</Badge>
              </div>
            </Card>
          </button>
        )
      })}
    </div>
  )
}

function BackButton({ onClick, label }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
      <ChevronLeftIcon className="w-4 h-4" /> {label}
    </button>
  )
}
