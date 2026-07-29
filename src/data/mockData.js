// Données de démonstration pour présenter le concept Marge.
// Tout est statique / en mémoire : aucun backend n'est requis pour le MVP.

export const subjects = [
  { id: 'maths', name: 'Mathématiques', short: 'Maths', accent: 'bg-brand-500' },
  { id: 'physique', name: 'Physique-Chimie', short: 'Physique', accent: 'bg-sky-500' },
  { id: 'francais', name: 'Français-Philosophie', short: 'Français', accent: 'bg-violet-500' },
  { id: 'anglais', name: 'Anglais LV1', short: 'Anglais', accent: 'bg-amber-500' },
  { id: 'info', name: 'Informatique', short: 'Info', accent: 'bg-rose-400' }
]

export const subjectProgress = {
  maths: 62,
  physique: 54,
  francais: 74,
  anglais: 81,
  info: 45
}

// Emploi du temps / échéances de la semaine en cours
export const weekEvents = [
  { id: 'ev1', day: 'Lundi', date: '28/07', time: '08:00', type: 'devoir', subjectId: 'maths', title: 'DM n°12 à rendre — Algèbre linéaire', done: true },
  { id: 'ev2', day: 'Lundi', date: '28/07', time: '14:00', type: 'colle', subjectId: 'anglais', title: 'Colle d\'anglais — groupe B', done: true },
  { id: 'ev3', day: 'Mardi', date: '29/07', time: '10:00', type: 'cours', subjectId: 'physique', title: 'TP Physique — Optique', done: false },
  { id: 'ev4', day: 'Mercredi', date: '30/07', time: '16:00', type: 'colle', subjectId: 'maths', title: 'Colle de maths — groupe A', done: false },
  { id: 'ev5', day: 'Jeudi', date: '31/07', time: '08:00', type: 'ds', subjectId: 'physique', title: 'DS Physique-Chimie (4h)', done: false },
  { id: 'ev6', day: 'Vendredi', date: '01/08', time: '18:00', type: 'devoir', subjectId: 'francais', title: 'Dissertation à rendre', done: false },
  { id: 'ev7', day: 'Samedi', date: '02/08', time: '08:00', type: 'ds', subjectId: 'maths', title: 'DS Mathématiques (4h)', done: false }
]

export const eventTypeLabels = {
  colle: { label: 'Colle', badge: 'bg-brand-100 text-brand-700' },
  ds: { label: 'DS', badge: 'bg-coach-100 text-coach-600' },
  devoir: { label: 'Devoir', badge: 'bg-violet-100 text-violet-700' },
  cours: { label: 'Cours', badge: 'bg-ink-100 text-ink-600' }
}

// Catégories d'erreurs récurrentes détectées lors des scans
export const errorCategories = {
  calcul: { label: 'Erreurs de calcul', tip: 'Ralentis sur les étapes intermédiaires et vérifie les signes.' },
  hypotheses: { label: 'Oubli d\'hypothèses', tip: 'Relis l\'énoncé et note les hypothèses avant de rédiger.' },
  redaction: { label: 'Rédaction / rigueur', tip: 'Structure tes réponses avec des phrases complètes et des conclusions claires.' },
  methode: { label: 'Erreur de méthode', tip: 'Revois la fiche méthode associée avant le prochain DS.' },
  notions: { label: 'Notion mal maîtrisée', tip: 'Reprends le cours sur cette notion avant de refaire des exercices.' }
}

// Copies scannées (historique), avec annotations simulées du prof
export const scans = [
  {
    id: 'scan-1',
    subjectId: 'maths',
    title: 'DS n°3 — Réduction des endomorphismes',
    date: '18/07/2026',
    grade: '12,5/20',
    annotations: [
      { id: 'a1', x: 22, y: 18, category: 'calcul', comment: 'Erreur de signe dans le déterminant' },
      { id: 'a2', x: 68, y: 30, category: 'hypotheses', comment: 'Tu oublies de vérifier que la matrice est diagonalisable' },
      { id: 'a3', x: 40, y: 55, category: 'calcul', comment: 'Erreur de calcul dans le produit matriciel' },
      { id: 'a4', x: 75, y: 72, category: 'redaction', comment: 'Conclusion attendue non rédigée' },
      { id: 'a5', x: 30, y: 85, category: 'methode', comment: 'Mauvais choix de méthode : privilégier la trigonalisation ici' }
    ]
  },
  {
    id: 'scan-2',
    subjectId: 'maths',
    title: 'DM n°10 — Séries numériques',
    date: '10/07/2026',
    grade: '14/20',
    annotations: [
      { id: 'a6', x: 25, y: 20, category: 'hypotheses', comment: 'Convergence non justifiée avant d\'appliquer le critère' },
      { id: 'a7', x: 60, y: 45, category: 'calcul', comment: 'Erreur dans le calcul de l\'équivalent' },
      { id: 'a8', x: 35, y: 68, category: 'redaction', comment: 'Résultat correct mais rédaction trop rapide' }
    ]
  },
  {
    id: 'scan-3',
    subjectId: 'physique',
    title: 'DS n°2 — Mécanique du point',
    date: '15/07/2026',
    grade: '11/20',
    annotations: [
      { id: 'a9', x: 30, y: 25, category: 'hypotheses', comment: 'Référentiel non précisé' },
      { id: 'a10', x: 55, y: 40, category: 'calcul', comment: 'Erreur d\'homogénéité — vérifie les unités' },
      { id: 'a11', x: 70, y: 60, category: 'notions', comment: 'Confusion entre force et énergie potentielle' },
      { id: 'a12', x: 40, y: 80, category: 'calcul', comment: 'Erreur de calcul en résolvant l\'équation différentielle' }
    ]
  },
  {
    id: 'scan-4',
    subjectId: 'francais',
    title: 'Dissertation — Le travail',
    date: '05/07/2026',
    grade: '13/20',
    annotations: [
      { id: 'a13', x: 20, y: 30, category: 'redaction', comment: 'Transition entre parties à travailler' },
      { id: 'a14', x: 65, y: 50, category: 'methode', comment: 'Plan déséquilibré, II trop court' },
      { id: 'a15', x: 45, y: 75, category: 'redaction', comment: 'Belle plume mais conclusion trop courte' }
    ]
  }
]

// Fiches de révision, certaines générées automatiquement à partir des erreurs détectées
export const fiches = [
  {
    id: 'f1',
    subjectId: 'maths',
    title: 'Réduction des endomorphismes — les pièges classiques',
    lastReviewed: '20/07/2026',
    linkedCategory: 'calcul',
    generated: true,
    summary: 'Erreurs de signe et de calcul matriciel repérées sur 2 copies récentes.'
  },
  {
    id: 'f2',
    subjectId: 'maths',
    title: 'Vérifier les hypothèses de diagonalisation',
    lastReviewed: null,
    linkedCategory: 'hypotheses',
    generated: true,
    summary: 'Tu oublies souvent de vérifier la diagonalisabilité avant de conclure.'
  },
  {
    id: 'f3',
    subjectId: 'physique',
    title: 'Mécanique du point — analyse dimensionnelle',
    lastReviewed: '22/07/2026',
    linkedCategory: 'calcul',
    generated: true,
    summary: 'Erreurs d\'homogénéité répétées : réflexe à automatiser.'
  },
  {
    id: 'f4',
    subjectId: 'physique',
    title: 'Force vs énergie potentielle : ne plus confondre',
    lastReviewed: null,
    linkedCategory: 'notions',
    generated: true,
    summary: 'Notion mal maîtrisée détectée sur le dernier DS.'
  },
  {
    id: 'f5',
    subjectId: 'francais',
    title: 'Construire des transitions efficaces',
    lastReviewed: '12/07/2026',
    linkedCategory: 'redaction',
    generated: true,
    summary: 'Les transitions entre parties manquent de fluidité.'
  },
  {
    id: 'f6',
    subjectId: 'anglais',
    title: 'Phrasal verbs — fiche de synthèse',
    lastReviewed: '25/07/2026',
    linkedCategory: null,
    generated: false,
    summary: 'Fiche personnelle, non liée à un scan.'
  },
  {
    id: 'f7',
    subjectId: 'info',
    title: 'Complexité algorithmique — rappels',
    lastReviewed: null,
    linkedCategory: null,
    generated: false,
    summary: 'À réviser avant le prochain TP noté.'
  }
]

export function computeErrorGroups(scanList = scans) {
  const groups = {}
  scanList.forEach((scan) => {
    scan.annotations.forEach((ann) => {
      const key = `${scan.subjectId}__${ann.category}`
      if (!groups[key]) {
        groups[key] = {
          key,
          subjectId: scan.subjectId,
          category: ann.category,
          count: 0,
          examples: []
        }
      }
      groups[key].count += 1
      if (groups[key].examples.length < 3) {
        groups[key].examples.push(ann.comment)
      }
    })
  })
  return Object.values(groups).sort((a, b) => b.count - a.count)
}

export function computeWeeklySynthesis(scanList = scans) {
  return computeErrorGroups(scanList).slice(0, 3)
}

// Réservoir de commentaires plausibles par matière, utilisé pour simuler
// l'extraction des annotations d'un nouveau scan (pas de vraie OCR dans le MVP).
export const annotationPool = {
  maths: [
    { category: 'calcul', comment: 'Erreur de calcul dans le développement' },
    { category: 'calcul', comment: 'Erreur de signe à cette ligne' },
    { category: 'hypotheses', comment: 'Domaine de définition non vérifié' },
    { category: 'hypotheses', comment: 'Condition d\'application du théorème non citée' },
    { category: 'redaction', comment: 'Conclusion manquante' },
    { category: 'methode', comment: 'Méthode plus longue que nécessaire, voir la fiche technique' },
    { category: 'notions', comment: 'Confusion entre suite et série' }
  ],
  physique: [
    { category: 'calcul', comment: 'Erreur d\'homogénéité, vérifie les unités' },
    { category: 'hypotheses', comment: 'Référentiel d\'étude non précisé' },
    { category: 'hypotheses', comment: 'Approximation non justifiée' },
    { category: 'redaction', comment: 'Schéma attendu pour appuyer le raisonnement' },
    { category: 'notions', comment: 'Confusion entre force et énergie' },
    { category: 'methode', comment: 'Bilan des forces incomplet' }
  ],
  francais: [
    { category: 'redaction', comment: 'Transition entre parties trop abrupte' },
    { category: 'redaction', comment: 'Syntaxe à retravailler sur ce paragraphe' },
    { category: 'methode', comment: 'Plan déséquilibré entre les parties' },
    { category: 'notions', comment: 'Référence à l\'œuvre imprécise' }
  ],
  anglais: [
    { category: 'redaction', comment: 'Erreur de grammaire : accord sujet-verbe' },
    { category: 'notions', comment: 'Faux-ami à corriger' },
    { category: 'methode', comment: 'Structure de l\'argumentation à clarifier' }
  ],
  info: [
    { category: 'methode', comment: 'Complexité de l\'algorithme non analysée' },
    { category: 'notions', comment: 'Confusion entre récursivité et itération' },
    { category: 'redaction', comment: 'Nommage de variables peu explicite' }
  ]
}

function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min))
}

export function generateScanResult(subjectId, title) {
  const pool = annotationPool[subjectId] || annotationPool.maths
  const count = Math.min(pool.length, randomBetween(3, 5))
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count)
  const usedZones = []
  const annotations = shuffled.map((item, i) => {
    let x, y
    do {
      x = randomBetween(15, 85)
      y = randomBetween(12, 88)
    } while (usedZones.some((z) => Math.abs(z.x - x) < 15 && Math.abs(z.y - y) < 15))
    usedZones.push({ x, y })
    return { id: `new-${Date.now()}-${i}`, x, y, category: item.category, comment: item.comment }
  })

  return {
    id: `scan-${Date.now()}`,
    subjectId,
    title: title || 'Nouvelle copie scannée',
    date: new Date().toLocaleDateString('fr-FR'),
    grade: null,
    annotations
  }
}

export const moodOptions = [
  { id: 'top', label: 'En forme', hint: 'Profite de ton énergie pour attaquer un point difficile.' },
  { id: 'ok', label: 'Ça va', hint: 'Un rythme régulier, continue comme ça.' },
  { id: 'fatigue', label: 'Un peu fatigué·e', hint: 'Privilégie la révision légère plutôt que du nouveau contenu.' },
  { id: 'charge', label: 'Sous pression', hint: 'Découpe ta liste en petites étapes, une chose à la fois.' }
]
