// Arbre de compétences par matière — suivi de progression sur les 2 ans de
// prépa, indépendant des notes ponctuelles. Chaque compétence se situe sur
// une échelle 1-5 auto-évaluée par l'élève.

export const levelLabels = ['Débutant', 'Intermédiaire', 'Avancé', 'Maîtrisé', 'Expert']

export const competencySubjects = [
  {
    id: 'maths',
    name: 'Mathématiques',
    accent: 'bg-brand-500',
    competencies: [
      { key: 'algebre', label: 'Algèbre linéaire' },
      { key: 'analyse', label: 'Analyse' },
      { key: 'probas', label: 'Probabilités' },
      { key: 'geometrie', label: 'Géométrie' },
      { key: 'redaction', label: 'Rédaction & méthodologie' }
    ]
  },
  {
    id: 'physique',
    name: 'Physique-Chimie',
    accent: 'bg-sky-500',
    competencies: [
      { key: 'mecanique', label: 'Mécanique' },
      { key: 'electromag', label: 'Électromagnétisme' },
      { key: 'thermo', label: 'Thermodynamique' },
      { key: 'optique', label: 'Optique' }
    ]
  },
  {
    id: 'francais',
    name: 'Français-Philosophie',
    accent: 'bg-violet-500',
    competencies: [
      { key: 'dissertation', label: 'Dissertation' },
      { key: 'analyse_texte', label: 'Analyse de texte' },
      { key: 'culture_generale', label: 'Culture générale' }
    ]
  },
  {
    id: 'anglais',
    name: 'Anglais LV1',
    accent: 'bg-amber-500',
    competencies: [
      { key: 'grammaire', label: 'Grammaire & expression écrite' },
      { key: 'comprehension', label: 'Compréhension orale' },
      { key: 'expression_orale', label: 'Expression orale' }
    ]
  },
  {
    id: 'info',
    name: 'Informatique',
    accent: 'bg-rose-400',
    competencies: [
      { key: 'algo', label: 'Algorithmique' },
      { key: 'structures', label: 'Structures de données' }
    ]
  },
  {
    id: 'oral',
    name: 'Oral / Khôlle',
    accent: 'bg-indigo',
    competencies: [
      { key: 'clarte', label: "Clarté d'exposition" },
      { key: 'structure', label: 'Structure du raisonnement' },
      { key: 'temps', label: 'Gestion du temps' },
      { key: 'reaction', label: 'Réaction aux questions' }
    ]
  }
]

export function allCompetencyKeys() {
  return competencySubjects.flatMap((s) => s.competencies.map((c) => `${s.id}__${c.key}`))
}
