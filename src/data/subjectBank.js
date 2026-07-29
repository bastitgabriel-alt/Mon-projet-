// Banque de sujets d'oraux (module B.3) — de vrais sujets de colle/khôlle
// niveau CPGE, organisés par matière et par chapitre (mêmes clés que
// data/competencies.js), classés par fréquence aux concours.

export const tierMeta = {
  incontournable: { label: 'Incontournable', tone: 'bg-coral-soft text-coral' },
  frequent: { label: 'Fréquent', tone: 'bg-amber-soft text-amber' },
  classique: { label: 'Classique', tone: 'bg-indigo-soft text-indigo' },
  piege: { label: 'Piège', tone: 'bg-ink-100 text-ink-600' },
  custom: { label: 'Personnel', tone: 'bg-teal-soft text-teal' }
}

function bank(entries) {
  return entries.map(([text, tier], i) => ({ id: `${text.slice(0, 12)}-${i}`, text, tier }))
}

export const subjectBank = {
  maths: {
    algebre: bank([
      ["Démontrer que si u est un endomorphisme nilpotent d'un espace vectoriel de dimension finie n, alors u^n = 0.", 'incontournable'],
      ['Soit A une matrice diagonalisable. Montrer que A et sa transposée ont les mêmes valeurs propres.', 'classique'],
      ['Un endomorphisme u vérifie u² = u. Caractériser une telle application.', 'frequent'],
      ['Piège : une matrice triangulaire supérieure est-elle toujours diagonalisable ? Donner un contre-exemple.', 'piege']
    ]),
    analyse: bank([
      ['Énoncer et démontrer le théorème des valeurs intermédiaires.', 'incontournable'],
      ['Étudier la nature de la série de terme général 1/(n·(ln n)²) par comparaison série-intégrale.', 'classique'],
      ['Soit f continue sur [0,1] avec f(0)=f(1). Montrer qu\'il existe c dans [0, 1/2] tel que f(c) = f(c+1/2).', 'frequent'],
      ['Piège : une fonction dérivable sur R a-t-elle nécessairement une dérivée continue ? Contre-exemple.', 'piege']
    ]),
    probas: bank([
      ['Énoncer la loi faible des grands nombres et expliquer son interprétation.', 'incontournable'],
      ['Soit X une variable aléatoire suivant une loi géométrique. Calculer son espérance.', 'classique'],
      ['Démontrer l\'inégalité de Bienaymé-Tchebychev et donner un exemple d\'application.', 'frequent'],
      ['Piège : deux événements indépendants peuvent-ils être incompatibles ?', 'piege']
    ]),
    geometrie: bank([
      ['Caractériser les isométries affines du plan qui n\'ont pas de point fixe.', 'incontournable'],
      ['Déterminer la nature et les éléments caractéristiques de la conique x² + 4y² - 2x = 3.', 'classique'],
      ['Démontrer que le produit vectoriel de deux vecteurs colinéaires est nul et interpréter géométriquement.', 'frequent'],
      ['Piège : deux droites de l\'espace non parallèles sont-elles nécessairement sécantes ?', 'piege']
    ]),
    redaction: bank([
      ['Présenter la méthode de démonstration par récurrence forte sur un exemple simple.', 'incontournable'],
      ['Quelles sont les étapes attendues dans la rédaction d\'une étude de fonction complète ?', 'classique'],
      ['Comment structurer la résolution d\'un problème d\'optimisation sous contrainte ?', 'frequent'],
      ['Piège : peut-on conclure une inégalité stricte à partir d\'inégalités larges passées à la limite ?', 'piege']
    ])
  },
  physique: {
    mecanique: bank([
      ['Établir l\'équation différentielle du mouvement d\'un pendule simple en petites oscillations.', 'incontournable'],
      ['Un solide glisse sans frottement sur un plan incliné. Déterminer son accélération.', 'classique'],
      ['Énoncer et démontrer le théorème de l\'énergie cinétique.', 'frequent'],
      ['Piège : dans un référentiel non galiléen, peut-on appliquer directement la RFD ?', 'piege']
    ]),
    electromag: bank([
      ['Établir le champ électrique créé par un fil infini uniformément chargé, via le théorème de Gauss.', 'incontournable'],
      ['Déterminer les conditions de passage du champ électrique à l\'interface entre deux milieux.', 'classique'],
      ['Expliquer le phénomène d\'induction électromagnétique et énoncer la loi de Faraday.', 'frequent'],
      ['Piège : le champ magnétique dérive-t-il toujours d\'un potentiel scalaire ?', 'piege']
    ]),
    thermo: bank([
      ['Énoncer les deux principes de la thermodynamique et leur signification physique.', 'incontournable'],
      ['Calculer le rendement du cycle de Carnot et commenter son caractère théorique.', 'classique'],
      ['Établir le premier principe pour un système fermé en transformation isobare.', 'frequent'],
      ['Piège : l\'entropie d\'un système isolé peut-elle diminuer au cours d\'une transformation réelle ?', 'piege']
    ]),
    optique: bank([
      ['Énoncer les lois de Snell-Descartes et les démontrer à partir du principe de Fermat.', 'incontournable'],
      ['Construire l\'image d\'un objet à travers une lentille mince convergente et discuter sa nature.', 'classique'],
      ['Décrire le phénomène de diffraction et son influence sur la résolution d\'un instrument.', 'frequent'],
      ['Piège : un rayon peut-il subir une réflexion totale vers un milieu plus réfringent ?', 'piege']
    ])
  },
  francais: {
    dissertation: bank([
      ['Comment construire une problématique qui évite la paraphrase du sujet ?', 'incontournable'],
      ['Quelle est la fonction de la troisième partie dans un plan dialectique ?', 'classique'],
      ['Comment articuler une citation d\'auteur au service de l\'argumentation sans la plaquer artificiellement ?', 'frequent'],
      ['Piège : faut-il toujours choisir un plan en trois parties, quel que soit le sujet ?', 'piege']
    ]),
    analyse_texte: bank([
      ['Quelle est la différence entre commentaire linéaire et commentaire composé ?', 'incontournable'],
      ['Comment analyser l\'effet d\'un changement de point de vue narratif sur la réception du texte ?', 'classique'],
      ['Comment repérer et interpréter une rupture de registre dans un texte littéraire ?', 'frequent'],
      ['Piège : une figure de style repérée doit-elle toujours être commentée, même hors sujet ?', 'piege']
    ]),
    culture_generale: bank([
      ['En quoi la notion d\'œuvre est-elle problématique au programme de cette année ?', 'incontournable'],
      ['Comment mobiliser une référence philosophique sans la simplifier à l\'excès ?', 'classique'],
      ['Comment relier une notion du programme à l\'actualité sans tomber dans le hors-sujet ?', 'frequent'],
      ['Piège : citer un auteur non étudié en cours est-il valorisé ou risqué à l\'oral ?', 'piege']
    ])
  },
  anglais: {
    grammaire: bank([
      ['Expliquer la différence d\'usage entre le prétérit et le present perfect.', 'incontournable'],
      ['Quand utiliser "would" pour exprimer une habitude passée, sans confusion avec le conditionnel ?', 'classique'],
      ['Expliquer la construction des verbes suivis de "to" + infinitif versus "-ing".', 'frequent'],
      ['Piège : "less" et "fewer" sont-ils interchangeables ?', 'piege']
    ]),
    comprehension: bank([
      ['Quelles stratégies utiliser face à un accent inconnu en compréhension orale ?', 'incontournable'],
      ['Comment prendre des notes efficaces pendant l\'écoute sans perdre le fil ?', 'classique'],
      ['Comment distinguer les faits des opinions dans un document oral argumentatif ?', 'frequent'],
      ['Piège : faut-il comprendre chaque mot pour restituer le sens général d\'un document ?', 'piege']
    ]),
    expression_orale: bank([
      ['Comment structurer une synthèse orale de document en 5 minutes ?', 'incontournable'],
      ['Comment réagir avec pertinence à une question inattendue du jury ?', 'classique'],
      ['Quelles techniques pour gagner en fluidité sans réciter un texte appris par cœur ?', 'frequent'],
      ['Piège : parler vite est-il un signe de maîtrise de la langue ?', 'piege']
    ])
  },
  info: {
    algo: bank([
      ['Expliquer le principe du tri fusion et donner sa complexité.', 'incontournable'],
      ['Comparer la complexité d\'une recherche dichotomique et d\'une recherche linéaire.', 'classique'],
      ['Expliquer le principe de la programmation dynamique sur un exemple simple.', 'frequent'],
      ['Piège : un algorithme en O(n log n) est-il toujours plus rapide en pratique qu\'un algorithme en O(n²) ?', 'piege']
    ]),
    structures: bank([
      ['Expliquer la différence entre une pile et une file, avec un exemple d\'usage pour chacune.', 'incontournable'],
      ['Comment fonctionne un arbre binaire de recherche, et quelle est la complexité d\'une recherche ?', 'classique'],
      ['Expliquer le principe de fonctionnement d\'une table de hachage.', 'frequent'],
      ['Piège : un arbre binaire de recherche non équilibré garantit-il une complexité en O(log n) ?', 'piege']
    ])
  }
}
