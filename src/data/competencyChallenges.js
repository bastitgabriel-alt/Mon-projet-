// Défis de validation des compétences (module C.2) — une compétence
// progresse en réussissant un défi concret plutôt qu'en s'auto-évaluant
// dans le vide. 2 défis par compétence : un pour valider le niveau
// "Avancé" (3), un pour "Expert" (5).

export const competencyChallenges = {
  maths__algebre: [
    { id: 'ma-3', targetLevel: 3, text: 'Résous 5 exercices sur la diagonalisation/trigonalisation sans regarder le cours.' },
    { id: 'ma-5', targetLevel: 5, text: 'Résous un problème type concours sur les espaces vectoriels en temps limité, sans erreur de méthode.' }
  ],
  maths__analyse: [
    { id: 'man-3', targetLevel: 3, text: 'Étudie la nature de 5 séries numériques différentes (Riemann, comparaison, d\'Alembert) sans aide.' },
    { id: 'man-5', targetLevel: 5, text: 'Résous un exercice type concours sur les suites/séries en moins de 30 minutes, rédaction complète.' }
  ],
  maths__probas: [
    { id: 'mp-3', targetLevel: 3, text: 'Calcule espérance et variance de 3 lois classiques (binomiale, géométrique, Poisson) sans formulaire.' },
    { id: 'mp-5', targetLevel: 5, text: 'Résous un problème de probabilités type concours avec variables à densité, sans aide.' }
  ],
  maths__geometrie: [
    { id: 'mg-3', targetLevel: 3, text: 'Détermine la nature de 5 coniques différentes à partir de leur équation cartésienne.' },
    { id: 'mg-5', targetLevel: 5, text: 'Résous un exercice de géométrie affine/euclidienne type concours en temps limité.' }
  ],
  maths__redaction: [
    { id: 'mr-3', targetLevel: 3, text: 'Rédige entièrement une démonstration par récurrence (initialisation, hérédité, conclusion).' },
    { id: 'mr-5', targetLevel: 5, text: 'Rédige la solution complète d\'un problème d\'optimisation sous contrainte, méthode et justifications incluses.' }
  ],
  physique__mecanique: [
    { id: 'pm-3', targetLevel: 3, text: 'Établis et résous l\'équation différentielle du mouvement pour 3 systèmes mécaniques différents.' },
    { id: 'pm-5', targetLevel: 5, text: 'Résous un problème de mécanique type concours (oscillateurs couplés, champ de force) sans aide.' }
  ],
  physique__electromag: [
    { id: 'pe-3', targetLevel: 3, text: 'Applique le théorème de Gauss pour déterminer le champ créé par 3 distributions de charges différentes.' },
    { id: 'pe-5', targetLevel: 5, text: 'Résous un problème d\'électromagnétisme type concours sur l\'induction ou les ondes, en temps limité.' }
  ],
  physique__thermo: [
    { id: 'pt-3', targetLevel: 3, text: 'Applique les deux principes de la thermodynamique sur 3 transformations différentes.' },
    { id: 'pt-5', targetLevel: 5, text: 'Résous un problème type concours sur un cycle moteur ou frigorifique complet.' }
  ],
  physique__optique: [
    { id: 'po-3', targetLevel: 3, text: 'Construis l\'image donnée par 3 systèmes optiques différents (lentille, miroir, association).' },
    { id: 'po-5', targetLevel: 5, text: 'Résous un problème d\'optique type concours incluant diffraction ou interférences.' }
  ],
  francais__dissertation: [
    { id: 'fd-3', targetLevel: 3, text: 'Construis un plan détaillé pour 3 sujets de dissertation différents en 15 minutes chacun.' },
    { id: 'fd-5', targetLevel: 5, text: 'Rédige une dissertation complète en temps limité (4h), introduction/développement/conclusion.' }
  ],
  francais__analyse_texte: [
    { id: 'fa-3', targetLevel: 3, text: 'Réalise le commentaire linéaire complet d\'un extrait, avec au moins 3 procédés d\'écriture identifiés.' },
    { id: 'fa-5', targetLevel: 5, text: 'Réalise un commentaire composé complet sur un texte non étudié en cours, en temps limité.' }
  ],
  francais__culture_generale: [
    { id: 'fc-3', targetLevel: 3, text: 'Relie 3 notions du programme à des références précises que tu peux citer de mémoire.' },
    { id: 'fc-5', targetLevel: 5, text: 'Construis un exposé oral de 5 minutes sur une notion du programme, problématique et références précises.' }
  ],
  anglais__grammaire: [
    { id: 'ag-3', targetLevel: 3, text: 'Identifie et corrige les erreurs dans 10 phrases utilisant les temps du passé.' },
    { id: 'ag-5', targetLevel: 5, text: 'Rédige un texte argumentatif de 300 mots sans erreur de temps ni de construction verbale.' }
  ],
  anglais__comprehension: [
    { id: 'ac-3', targetLevel: 3, text: 'Comprends et restitue les idées principales de 3 documents audio authentiques différents.' },
    { id: 'ac-5', targetLevel: 5, text: 'Comprends un document audio rapide et non scripté et restitue les positions de chaque intervenant.' }
  ],
  anglais__expression_orale: [
    { id: 'ae-3', targetLevel: 3, text: 'Présente une synthèse orale de document de 3 minutes sans notes écrites détaillées.' },
    { id: 'ae-5', targetLevel: 5, text: 'Réponds avec pertinence et sans hésitation à 5 questions inattendues sur un sujet préparé.' }
  ],
  info__algo: [
    { id: 'ia-3', targetLevel: 3, text: 'Implémente et explique la complexité de 3 algorithmes de tri différents.' },
    { id: 'ia-5', targetLevel: 5, text: 'Résous un problème algorithmique type concours nécessitant de la programmation dynamique.' }
  ],
  info__structures: [
    { id: 'is-3', targetLevel: 3, text: 'Explique et compare pile, file et arbre binaire de recherche sur des cas d\'usage concrets.' },
    { id: 'is-5', targetLevel: 5, text: 'Implémente une table de hachage avec gestion des collisions et explique sa complexité.' }
  ],
  oral__clarte: [
    { id: 'oc-3', targetLevel: 3, text: 'Fais une colle dont le bilan juge la clarté bonne, sans hésitation majeure relevée.' },
    { id: 'oc-5', targetLevel: 5, text: 'Fais 3 colles consécutives avec une clarté jugée bonne dans le bilan.' }
  ],
  oral__structure: [
    { id: 'os-3', targetLevel: 3, text: 'Fais une colle dont le bilan confirme une introduction, un plan et une conclusion identifiables.' },
    { id: 'os-5', targetLevel: 5, text: 'Fais 3 colles consécutives où le bilan confirme une structure claire à chaque fois.' }
  ],
  oral__temps: [
    { id: 'ot-3', targetLevel: 3, text: 'Termine un exposé en Mode Khôlle sans dépasser le temps alloué de plus d\'une minute.' },
    { id: 'ot-5', targetLevel: 5, text: 'Termine 3 exposés de suite en Mode Khôlle dans le temps imparti, à la minute près.' }
  ],
  oral__reaction: [
    { id: 'or-3', targetLevel: 3, text: 'Réponds à au moins 2 questions de rappel sans qu\'aucune ne reste sans réponse.' },
    { id: 'or-5', targetLevel: 5, text: 'Fais une colle dont le bilan souligne une bonne réaction aux questions sur l\'ensemble de l\'échange.' }
  ]
}
