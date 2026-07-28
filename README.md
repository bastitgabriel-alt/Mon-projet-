# No-Show Manager

Application web full-stack destinée aux praticiens paramédicaux indépendants
(kinésithérapeutes, ostéopathes, ...) pour réduire les rendez-vous non honorés
(no-shows) grâce à un score de risque calculé par patient.

## Stack technique

- **Frontend** : React 18 + Vite, React Router, client `@supabase/supabase-js`
- **Backend** : Node.js + Express (API REST)
- **Base de données & Auth** : Supabase (PostgreSQL managé + Auth email/mot de passe)

Le frontend s'authentifie directement auprès de Supabase (email/mot de passe).
Le backend Express reçoit le JWT Supabase à chaque requête, le vérifie, puis
utilise la clé `service_role` pour lire/écrire dans PostgreSQL (la Row Level
Security reste active en base comme filet de sécurité complémentaire).

## Structure du projet

```
supabase/
  migrations/0001_init.sql   # schéma complet (tables, RLS, triggers)
  config.toml                # config Supabase CLI pour le dev local
backend/
  src/index.js                # serveur Express
  src/middleware/auth.js       # vérification du JWT Supabase
  src/routes/                 # patients, rendez-vous, dashboard, praticien
frontend/
  src/pages/                  # Login, Register, Dashboard, Patients
  src/components/             # Layout, modales, badges de statut/risque
  src/lib/                     # client Supabase, appels API, contexte auth
render.yaml                   # déploiement backend sur Render
frontend/vercel.json           # déploiement frontend sur Vercel
```

## Modèle de données

- **practitioners** : profil praticien (créé automatiquement à l'inscription
  via un trigger sur `auth.users`).
- **patients** : `nom`, `telephone`, `email`, `risk_score`, `total_rdv`,
  `total_incidents`.
- **rendez_vous** : `patient_id`, `date_heure`, `statut`
  (`confirme`, `en_attente`, `annule`, `honore`, `no_show`), `notes`.

### Score de risque

`risk_score = (annulations + no-shows) / total des rendez-vous du patient`

Il est recalculé automatiquement par un trigger PostgreSQL à chaque création,
mise à jour de statut ou suppression d'un rendez-vous — aucun calcul côté
application n'est nécessaire.

### Compteur « no-shows évités ce mois-ci »

Nombre de rendez-vous du mois en cours avec le statut `honore` dont le patient
a un score de risque ≥ 30 % au moment de la requête (patient statistiquement
à risque qui a malgré tout honoré son rendez-vous). Le seuil est ajustable
dans `backend/src/routes/dashboard.js`.

## Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Appliquez la migration :
   - Via le SQL Editor du dashboard Supabase : collez le contenu de
     `supabase/migrations/0001_init.sql` et exécutez-le, **ou**
   - Via la Supabase CLI :
     ```bash
     supabase login
     supabase link --project-ref <votre-project-ref>
     supabase db push
     ```
3. Dans **Project Settings > API**, récupérez :
   - `Project URL`
   - `anon public key` (pour le frontend)
   - `service_role key` (pour le backend, **à ne jamais exposer côté client**)
4. Dans **Authentication > Providers**, l'authentification email/mot de passe
   est activée par défaut. Vous pouvez désactiver la confirmation par email
   pour simplifier les tests (**Authentication > Email**).

## Lancer en local

### Backend

```bash
cd backend
cp .env.example .env   # renseignez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev             # démarre sur http://localhost:3001
```

### Frontend

```bash
cd frontend
cp .env.example .env    # renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
npm install
npm run dev              # démarre sur http://localhost:5173
```

Ouvrez `http://localhost:5173`, créez un compte praticien, ajoutez un patient
puis un rendez-vous.

## Déploiement

Le dépôt contient les fichiers de configuration pour déployer sur des
plateformes gratuites/managées. Un projet Supabase et des comptes
Render/Vercel (ou équivalents) sont nécessaires — ces identifiants ne peuvent
pas être générés automatiquement et doivent être fournis par vous.

### Backend — Render

1. Créez un nouveau service à partir de ce dépôt ; `render.yaml` définit déjà
   le service `no-show-manager-backend` (`rootDir: backend`).
2. Renseignez les variables d'environnement `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY` et `CORS_ORIGIN` (URL du frontend déployé).

### Frontend — Vercel

1. Importez le dépôt sur Vercel avec **Root Directory = `frontend`**
   (`frontend/vercel.json` configure déjà build et rewrites SPA).
2. Renseignez les variables d'environnement `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY` et `VITE_API_URL` (URL du backend déployé).

Toute autre plateforme Node (Railway, Fly.io, ...) et tout autre hébergeur
statique (Netlify, Cloudflare Pages, ...) fonctionnent de la même façon tant
que les mêmes variables d'environnement sont fournies.

## Roadmap (hors V1)

- Rappels automatiques (SMS/email) aux patients à risque élevé avant leur
  rendez-vous.
- Historique détaillé par patient et export des statistiques.
- Gestion multi-praticien / cabinet.
