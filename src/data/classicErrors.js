// Extraits de copies avec une erreur classique volontairement glissée dedans
// (module D.5) — l'élève doit identifier le type d'erreur, parmi les mêmes
// catégories que celles détectées sur les vrais scans (data/mockData.js).

export const classicErrors = [
  {
    id: 'ce1',
    subjectId: 'maths',
    excerpt: 'On cherche à résoudre x² = 4. On en déduit directement que x = 2.',
    category: 'hypotheses',
    explanation: 'Oubli de cas : x² = 4 admet aussi la solution x = -2. Il fallait écrire x = ±2.'
  },
  {
    id: 'ce2',
    subjectId: 'maths',
    excerpt: 'On développe : (2x + 3)² = 4x² + 9.',
    category: 'calcul',
    explanation: 'Erreur de calcul : le double produit a été oublié. (2x+3)² = 4x² + 12x + 9.'
  },
  {
    id: 'ce3',
    subjectId: 'maths',
    excerpt: 'La suite (u_n) est croissante et majorée par 5. Donc elle converge vers 5.',
    category: 'redaction',
    explanation: "Mauvaise justification : le théorème garantit la convergence vers UNE limite ≤ 5, pas forcément vers 5 lui-même."
  },
  {
    id: 'ce4',
    subjectId: 'maths',
    excerpt: "Pour la limite de (1+1/n)ⁿ, on calcule terme à terme : (1+0)^∞ = 1.",
    category: 'methode',
    explanation: "Erreur de méthode : c'est une forme indéterminée 1^∞. Il fallait passer par le logarithme avant de conclure."
  },
  {
    id: 'ce5',
    subjectId: 'maths',
    excerpt: 'La suite (u_n) tend vers 0, donc la série de terme général u_n converge.',
    category: 'notions',
    explanation: "Confusion de concepts : u_n → 0 est une condition nécessaire à la convergence de la série, mais pas suffisante (ex : série harmonique)."
  },
  {
    id: 'ce6',
    subjectId: 'physique',
    excerpt: "On applique directement la relation fondamentale de la dynamique dans le référentiel du manège en rotation.",
    category: 'hypotheses',
    explanation: "Oubli d'hypothèse : ce référentiel n'est pas galiléen, il fallait ajouter les forces d'inertie (centrifuge, Coriolis)."
  },
  {
    id: 'ce7',
    subjectId: 'physique',
    excerpt: 'On a P = U × I avec U = 12 V et I = 0,5 A, donc P = 60 W.',
    category: 'calcul',
    explanation: 'Erreur de calcul : 12 × 0,5 = 6, pas 60. P = 6 W.'
  },
  {
    id: 'ce8',
    subjectId: 'physique',
    excerpt: 'Le système est à l\'équilibre. Donc la résultante des forces est nulle.',
    category: 'redaction',
    explanation: "Mauvaise justification : l'affirmation est correcte mais le théorème (première loi de Newton) n'est jamais cité explicitement."
  },
  {
    id: 'ce9',
    subjectId: 'physique',
    excerpt: "Pour trouver la vitesse limite d'une chute avec frottements, on résout l'équation différentielle complète à chaque instant.",
    category: 'methode',
    explanation: "Erreur de méthode : la vitesse limite s'obtient bien plus simplement en posant l'accélération nulle directement dans l'équation."
  },
  {
    id: 'ce10',
    subjectId: 'physique',
    excerpt: "La tension aux bornes d'un condensateur peut varier instantanément lors d'un échelon de tension.",
    category: 'notions',
    explanation: "Confusion de concepts : la tension aux bornes d'un condensateur est nécessairement continue, elle ne peut pas être discontinue."
  }
]
