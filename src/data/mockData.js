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

// Moyenne actuelle par matière (sur 20) — distinct de subjectProgress, qui
// mesure l'avancement dans le programme, pas le niveau.
export const subjectAverages = {
  maths: 14.2,
  physique: 12.5,
  francais: 13.8,
  anglais: 15.4,
  info: 11.6
}

// Historique de note sur les 5 derniers DS, par matière — alimente le
// graphique d'évolution du dashboard.
export const gradeHistory = {
  maths: [13.5, 13.8, 13.2, 14.6, 14.2],
  physique: [11.8, 12.2, 11.5, 12.8, 12.5],
  anglais: [15.0, 15.2, 15.6, 15.8, 15.4],
  francais: [13.2, 13.4, 12.9, 13.6, 13.8]
}

// Objectif concours affiché sur le dashboard
export const competitionGoal = {
  school: 'Centrale-Supélec',
  targetRank: 400,
  estimatedRank: 650,
  progress: 61
}

// Date cible pour le compte à rebours ("J-XXX avant les premiers écrits")
export const examTargetDate = '2027-04-15'

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
    question: 'Comment réduire un endomorphisme, et quels sont les pièges classiques à éviter ?',
    lastReviewed: '20/07/2026',
    linkedCategory: 'calcul',
    generated: true,
    summary: "Méthode en 4 étapes :\n1) Calculer le polynôme caractéristique det(A − λI).\n2) Trouver les valeurs propres, c'est-à-dire les racines de ce polynôme.\n3) Pour chaque valeur propre λ, résoudre le système (A − λI)X = 0 pour obtenir le sous-espace propre associé.\n4) Vérifier que la somme des dimensions des sous-espaces propres est égale à n avant de conclure à la diagonalisabilité.\n\nPièges classiques :\n– Erreur de signe en développant le déterminant : bien appliquer le facteur (−1)^(i+j) de la comatrice à chaque terme.\n– Confondre valeur propre et vecteur propre en résolvant le système linéaire.\n– Oublier de vérifier la dimension du sous-espace propre associé à une valeur propre multiple : le polynôme caractéristique scindé ne suffit pas.\n\nÀ retenir : une matrice non diagonalisable peut souvent être trigonalisée — pense à cette alternative si un sous-espace propre est de dimension trop petite."
  },
  {
    id: 'f2',
    subjectId: 'maths',
    title: 'Vérifier les hypothèses de diagonalisation',
    question: "Quelles hypothèses vérifier avant d'affirmer qu'une matrice est diagonalisable ?",
    lastReviewed: null,
    linkedCategory: 'hypotheses',
    generated: true,
    summary: "Une matrice A est diagonalisable si et seulement si la somme des dimensions de ses sous-espaces propres est égale à n.\n\nCela équivaut à deux conditions cumulatives :\n1) le polynôme caractéristique est scindé (racines dans le corps considéré),\n2) pour chaque valeur propre, la dimension du sous-espace propre égale son ordre de multiplicité algébrique.\n\nPiège classique : conclure « diagonalisable » dès que le polynôme caractéristique est scindé, sans vérifier chaque sous-espace propre individuellement — cette vérification est indispensable dès qu'une valeur propre est multiple (ordre ≥ 2).\n\nRéflexe utile : si dim(sous-espace propre) < ordre de multiplicité pour au moins une valeur propre, la matrice n'est pas diagonalisable — regarde alors du côté de la trigonalisation."
  },
  {
    id: 'f3',
    subjectId: 'physique',
    title: 'Mécanique du point — analyse dimensionnelle',
    question: "Comment utiliser l'analyse dimensionnelle pour vérifier un résultat de mécanique ?",
    lastReviewed: '22/07/2026',
    linkedCategory: 'calcul',
    generated: true,
    summary: "L'analyse dimensionnelle permet de vérifier l'homogénéité d'une formule avant même de faire les calculs numériques.\n\nDimensions de base : [L] longueur, [M] masse, [T] temps.\n\nGrandeurs courantes :\n– une vitesse : L·T⁻¹\n– une accélération : L·T⁻²\n– une force : M·L·T⁻²\n– une énergie (ou un travail) : M·L²·T⁻²\n– une puissance : M·L²·T⁻³\n\nRéflexe à automatiser : sur chaque résultat final, vérifie que les deux membres de l'équation ont la même dimension. Si un calcul donne par exemple une vitesse en m²/s, il y a forcément une erreur en amont — inutile de continuer avant de la corriger, ça fait gagner du temps en DS."
  },
  {
    id: 'f4',
    subjectId: 'physique',
    title: 'Force vs énergie potentielle : ne plus confondre',
    question: "Quelle est la relation entre force et énergie potentielle, et quelle confusion faut-il éviter ?",
    lastReviewed: null,
    linkedCategory: 'notions',
    generated: true,
    summary: "La force dérive de l'énergie potentielle : F = −dEp/dx en une dimension (F = −∇Ep en trois dimensions).\n\nLa force pointe toujours dans le sens où l'énergie potentielle diminue — un système évolue spontanément vers les états de plus basse énergie potentielle.\n\nÀ ne pas confondre :\n– Ep est un scalaire, exprimé en Joules.\n– F est un vecteur, exprimé en Newtons.\n\nPiège classique : oublier le signe moins dans la relation, ou confondre Ep avec le travail qu'elle fournit. Le bon lien est W = −ΔEp (le travail d'une force conservative est l'opposé de la variation d'énergie potentielle), et non Ep directement."
  },
  {
    id: 'f5',
    subjectId: 'francais',
    title: 'Construire des transitions efficaces',
    question: 'Comment construire une transition efficace entre deux parties de dissertation ?',
    lastReviewed: '12/07/2026',
    linkedCategory: 'redaction',
    generated: true,
    summary: "Une bonne transition remplit trois fonctions :\n1) elle rappelle brièvement l'acquis de la partie précédente,\n2) elle en montre la limite ou l'insuffisance,\n3) elle annonce ce qu'apporte la partie suivante.\n\nÀ éviter : les transitions plates du type « Nous allons maintenant voir... », qui n'apportent aucune valeur argumentative.\n\nÀ privilégier : une transition qui pose une question ou soulève un problème logique, de sorte que le passage à la partie suivante apparaisse comme une nécessité de la réflexion, et non comme un simple découpage administratif du plan."
  },
  {
    id: 'f6',
    subjectId: 'anglais',
    title: 'Phrasal verbs — fiche de synthèse',
    question: 'Quels sont les phrasal verbs anglais les plus utiles à connaître par cœur ?',
    lastReviewed: '25/07/2026',
    linkedCategory: null,
    generated: false,
    summary: "to give up — abandonner\nto look forward to — attendre avec impatience\nto put off — reporter\nto come across — tomber sur (par hasard)\nto get on with — s'entendre avec / continuer (une tâche)\nto break down — tomber en panne / craquer (émotionnellement)\nto carry out — réaliser, mener à bien\nto bring up — élever (un enfant) / mentionner (un sujet)\nto figure out — comprendre, résoudre\nto run out of — manquer de, être à court de\n\nAstuce : le sens d'un phrasal verb est souvent très différent de celui du verbe seul (« to give up » n'a rien à voir avec « donner »). Mieux vaut les apprendre par cœur comme du vocabulaire à part entière plutôt que d'essayer de les déduire logiquement."
  },
  {
    id: 'f7',
    subjectId: 'info',
    title: 'Complexité algorithmique — rappels',
    question: 'Quelles sont les classes de complexité algorithmique à connaître, et comment les déterminer ?',
    lastReviewed: null,
    linkedCategory: null,
    generated: false,
    summary: "Notations classiques, de la plus rapide à la plus lente :\n– O(1) : constant (accès direct à un élément)\n– O(log n) : logarithmique (recherche dichotomique)\n– O(n) : linéaire (parcours simple d'une structure)\n– O(n log n) : quasi-linéaire (tri fusion, tri rapide en moyenne)\n– O(n²) : quadratique (double boucle imbriquée, tris naïfs)\n– O(2ⁿ) : exponentiel (récursion naïve sans mémoïsation)\n\nMéthode pour déterminer la complexité d'un algorithme : compter le nombre d'opérations élémentaires en fonction de la taille n de l'entrée, puis ne garder que le terme dominant (on ignore les constantes multiplicatives et les termes de degré inférieur)."
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
  { id: 'serein', emoji: '🙂', label: 'Serein', hint: 'Profite de ton énergie pour attaquer un point difficile.' },
  { id: 'pression', emoji: '😬', label: 'Sous pression', hint: 'Découpe ta liste en petites étapes, une chose à la fois.' },
  { id: 'epuise', emoji: '😴', label: 'Épuisé', hint: 'Privilégie la révision légère plutôt que du nouveau contenu.' }
]
