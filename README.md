# Marge

Marge est une appli tout-en-un pour les élèves de prépa (CPGE) : organisation, révision, et scan de copies annotées par les profs pour cibler les erreurs récurrentes.

## MVP web

Ce dépôt contient le MVP web : React + Vite, Tailwind CSS, pensé mobile-first (PWA installable), utilisable aussi sur desktop.

Aucun backend : les données sont simulées avec des jeux de données de démonstration (`src/data/mockData.js`) et l'état créé par l'utilisateur (fiches, humeur du jour, révisions) est persisté en `localStorage`.

### Fonctionnalités

- **Dashboard** — échéances de la semaine (colles, DS, devoirs), indicateur de charge mentale, accès rapide au scan et aux fiches, progression par matière.
- **Scan de copie** — upload/photo d'une copie annotée, simulation de l'extraction des annotations du prof, regroupement des erreurs récurrentes par type/matière, synthèse actionnable ("tes 3 points à travailler cette semaine") avec création de fiches en un clic.
- **Fiches de révision** — liste par matière, générées depuis les scans ou personnelles, suivi de la dernière révision.

### Démarrer en local

```bash
npm install
npm run dev
```

### Build de production

```bash
npm run build
npm run preview
```
