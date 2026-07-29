// Démonstrations classiques niveau CPGE, découpées en étapes pour le Mode
// Démonstration (module D.4) — l'élève doit reconstituer la suite logique.

export const demonstrations = [
  {
    id: 'racine2',
    subjectId: 'maths',
    title: 'Irrationalité de √2',
    steps: [
      'Supposons par l\'absurde que √2 = p/q, avec p et q entiers premiers entre eux.',
      'Alors p² = 2q², donc p² est pair, donc p est pair.',
      'Écrivons p = 2k. On obtient 4k² = 2q², soit q² = 2k², donc q est pair aussi.',
      'p et q sont tous deux pairs, ce qui contredit l\'hypothèse qu\'ils sont premiers entre eux.',
      'Donc √2 ne peut pas s\'écrire comme une fraction p/q : il est irrationnel.'
    ]
  },
  {
    id: 'rolle',
    subjectId: 'maths',
    title: 'Théorème de Rolle',
    steps: [
      'Soit f continue sur [a,b], dérivable sur ]a,b[, avec f(a) = f(b).',
      'f est continue sur un segment, donc elle atteint un maximum M et un minimum m sur [a,b].',
      'Si M = m, f est constante : f\'(x) = 0 pour tout x convient.',
      'Sinon, le maximum ou le minimum est atteint en un point c strictement à l\'intérieur de ]a,b[.',
      'En ce point c, f admet un extremum local, donc f\'(c) = 0.'
    ]
  },
  {
    id: 'gendarmes',
    subjectId: 'maths',
    title: 'Théorème des gendarmes',
    steps: [
      'Soient u, v, w trois suites telles que u_n ≤ v_n ≤ w_n à partir d\'un certain rang.',
      'Supposons que u_n et w_n convergent toutes les deux vers la même limite L.',
      'Pour tout ε > 0, il existe des rangs à partir desquels u_n et w_n sont dans [L-ε, L+ε].',
      'À partir du plus grand de ces rangs, L-ε ≤ u_n ≤ v_n ≤ w_n ≤ L+ε.',
      'Donc v_n est aussi dans [L-ε, L+ε] à partir d\'un certain rang : v_n converge vers L.'
    ]
  },
  {
    id: 'suite-geometrique',
    subjectId: 'maths',
    title: 'Convergence d\'une suite géométrique de raison |q| < 1',
    steps: [
      'Soit (u_n) géométrique de raison q avec |q| < 1, u_n = u_0 · qⁿ.',
      'Si u_0 = 0, la suite est nulle et converge trivialement vers 0.',
      'Sinon, on étudie |u_n| = |u_0| · |q|ⁿ, qui décroît car |q| < 1.',
      'Pour tout ε > 0, on peut trouver N tel que |q|^N < ε / |u_0|, car |q|ⁿ tend vers 0.',
      'Donc pour n ≥ N, |u_n| < ε : la suite converge bien vers 0.'
    ]
  },
  {
    id: 'pendule',
    subjectId: 'physique',
    title: 'Équation du pendule simple en petites oscillations',
    steps: [
      'On isole le pendule (masse m, longueur l) et on applique le théorème du moment cinétique.',
      'Seule la composante tangentielle du poids travaille (la tension ne travaille pas).',
      'On obtient l·θ\'\' = -g·sin(θ).',
      'Pour les petites oscillations, on approxime sin(θ) ≈ θ.',
      'L\'équation devient θ\'\' + (g/l)·θ = 0 : un oscillateur harmonique de pulsation √(g/l).'
    ]
  },
  {
    id: 'energie-cinetique',
    subjectId: 'physique',
    title: 'Théorème de l\'énergie cinétique',
    steps: [
      'On part du principe fondamental de la dynamique : m·a = ΣF.',
      'On projette sur la trajectoire et on multiplie par la vitesse v = dx/dt.',
      'm·v·(dv/dt) = ΣF·v, soit d(½mv²)/dt = puissance des forces.',
      'On intègre entre deux instants : la variation d\'énergie cinétique égale le travail des forces.',
      'On retrouve ΔEc = ΣW(forces) entre les deux instants.'
    ]
  }
]
