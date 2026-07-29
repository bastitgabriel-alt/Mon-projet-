// Générateur de questions pour le Mode Calcul Mental (module D.3). Limité
// aux types vérifiables de façon fiable en JS pur (produits, pourcentages,
// ordres de grandeur, racines approchées) — pas de dérivées symboliques ou
// de calcul matriciel, qui demanderaient un vrai moteur de calcul formel
// pour être corrigés de façon fiable.

function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1))
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeMCQ(prompt, correct, spread) {
  const options = new Set([correct])
  let guard = 0
  while (options.size < 4 && guard < 50) {
    guard++
    const delta = randInt(-spread, spread)
    if (delta !== 0) options.add(correct + delta)
  }
  const shuffled = shuffle([...options])
  return { prompt, options: shuffled.map((n) => String(n)), correctIndex: shuffled.indexOf(correct) }
}

function questionProduit() {
  const a = randInt(11, 29)
  const b = randInt(2, 9)
  return makeMCQ(`${a} × ${b} = ?`, a * b, 15)
}

function questionPourcentage() {
  const pct = [10, 15, 20, 25, 50][randInt(0, 4)]
  const base = randInt(2, 40) * 10
  const correct = Math.round((base * pct) / 100)
  return makeMCQ(`${pct} % de ${base} = ?`, correct, Math.max(5, Math.round(correct * 0.2)))
}

function questionOrdreGrandeur() {
  const exp = randInt(-3, 6)
  const mantissa = (Math.random() * 9 + 1).toFixed(1)
  const shuffled = shuffle([exp - 2, exp - 1, exp, exp + 1])
  return {
    prompt: `Ordre de grandeur (puissance de 10) de ${mantissa} × 10^${exp} ?`,
    options: shuffled.map((e) => `10^${e}`),
    correctIndex: shuffled.indexOf(exp)
  }
}

function questionRacine() {
  const n = randInt(2, 120)
  const correct = Math.round(Math.sqrt(n))
  return makeMCQ(`Valeur approchée de √${n} à l'entier le plus proche ?`, correct, 2)
}

const GENERATORS = [questionProduit, questionPourcentage, questionOrdreGrandeur, questionRacine]

export function generateMentalCalcQuestion() {
  return GENERATORS[randInt(0, GENERATORS.length - 1)]()
}

export function timeForStreak(streak) {
  return Math.max(3, 8 - streak * 0.5)
}
