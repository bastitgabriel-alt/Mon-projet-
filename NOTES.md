# Épure — journal de refonte

Thème de travail : **« Épure — test »** (`gid://shopify/OnlineStoreTheme/190228529476`), non publié.
Thème publié : « Helio » — jamais modifié (§9.1).

Le thème parent est **Helio**, de génération *Horizon* — pas Dawn. L'architecture
repose sur des blocs de thème (`{% content_for 'blocks' %}`), pas sur les sections
Dawn. Toute recette écrite pour Dawn est inapplicable telle quelle.

---

## Étape 1 — Tokens et polices ✅

### Décidé

**Palette « Atelier »**, contrastes calculés et non estimés :

| Token | Valeur | Rôle |
|---|---|---|
| `--e-fond` | `#EFEAE4` | fond principal |
| `--e-surface` | `#F7F4F0` | surface haute |
| `--e-sable` | `#E0D3C4` | valeur chaude, sections alternées |
| `--e-encre` | `#221E1C` | texte principal |
| `--e-encre-2` | `#645B54` | texte secondaire |
| `--e-accent` | `#2F4438` | accent unique |
| `--e-ligne` | `#D5CCC2` | filet décoratif |
| `--e-ligne-forte` | `#7C7671` | filet fonctionnel |

Ratios vérifiés (WCAG 2.1) — toutes les paires de texte passent AA :

```
encre       sur fond / surface / sable : 13.82 / 15.08 / 11.24   AAA
encre-2     sur fond / surface / sable :  5.55 /  6.05 /  4.51   AA
accent      sur fond / surface / sable :  8.76 /  9.55 /  7.12   AAA
fond        sur accent                 :  8.76                   AAA
ligne-forte sur fond / surface / sable :  3.75 /  4.09 /  3.05   AA non-texte
```

**Polices auto-hébergées.** Bricolage Grotesque (display) + Instrument Sans
(texte), licence SIL OFL 1.1, fichiers variables déposés dans `assets/`.
149 Ko au total pour les quatre sous-ensembles.

### Écarté, et pourquoi

- **`@import` Google Fonts.** C'était l'état antérieur. Viole le §3 (CDN tiers)
  et bloque le rendu. Remplacé par de l'auto-hébergement.
- **`font_picker` de Shopify.** Aurait évité l'hébergement, mais la bibliothèque
  Shopify ne propose ni Bricolage Grotesque ni Instrument Sans.
- **Envoi des polices en base64.** Fonctionne, mais ~200 Ko de texte à
  transmettre. Le type de corps `URL` de `themeFilesUpsert` fait télécharger
  Shopify côté serveur : même résultat, sans le coût.
- **`#665D56` en encre secondaire.** Retenu au départ, rejeté au contrôle :
  4,37 sur le sable, sous le seuil AA de 4,5. Assombri en `#645B54`.
- **Un seul token de filet.** `#D5CCC2` plafonne à 1,33 — inutilisable dès qu'un
  filet délimite un composant. D'où le dédoublement décoratif / fonctionnel.

### Corrigé au passage

`assets/epure-theme.css` a été entièrement réécrit : **0 `!important`,
0 `@import`, 0 valeur en dur** (vérifié après retrait des commentaires).
Les surcharges passent par la spécificité et l'ordre de chargement.

---

## Étape 2 — Hero comparateur ✅

### Ce qui existait déjà

`blocks/comparison-slider.liquid` (21 Ko) et `assets/comparison-slider.js`
étaient présents dans Helio. La technique est bonne et a été **reprise, pas
réinventée** : `clip-path: inset()` piloté par une propriété `--compare`, et
déplacement délégué à un `<input type="range">` natif.

Ce dernier choix est le bon : le navigateur fournit alors le pointeur, le
tactile, le clavier (flèches, Origine/Fin), le rôle « slider » et
`aria-valuenow` sans une ligne de code.

### Les six manques du natif au regard du §5

| Point | État natif |
|---|---|
| Focus visible | `.cs-slider { opacity: 0 }` — focus **invisible**, échec WCAG 2.4.7 |
| Pas clavier de 5 % | pas de `step` → pas de 1 % |
| `prefers-reduced-motion` | animation en chaîne de `setTimeout`, non gardée |
| Position initiale réglable | `value="50"` en dur |
| Légende | absente |
| Mention légale | absente |

À quoi s'ajoutait un schema en clés `t:`, alors que le §3 impose des libellés
en français.

### Décidé

Composant autonome `blocks/epure-comparateur.liquid` + `assets/epure-comparateur.js`
(3,4 Ko). Le §5 demande explicitement « un composant autonome, réutilisable,
avec schema éditable » : cela prime ici sur le §11, et c'est signalé comme tel.

- **Focus** : l'input reste transparent par nécessité, c'est la poignée qui
  matérialise le focus clavier via `:has(:focus-visible)`.
- **Animation** : `requestAnimationFrame` avec une sinusoïde 50 → 65 → 50,
  plutôt qu'une chaîne de quatre `setTimeout`. Une seule poignée à annuler au
  démontage, et aucune écriture sur un élément détaché.
- **Mouvement réduit** : l'observateur n'est même pas créé si
  `prefers-reduced-motion` est actif — l'animation ne peut pas se déclencher.
- **Format mobile distinct** : un 16/9 plein cadre devient une bande illisible
  sur un écran étroit. Le hero est donc en paysage sur ordinateur, en portrait
  sur mobile.
- **`est_hero`** : bascule les images en `eager` + `fetchpriority="high"`.
  Décoché par défaut, avec un avertissement dans le schema.

### Écarté

- **Modifier `blocks/comparison-slider.liquid` en place.** Plus court, mais
  écrasé à la première mise à jour du thème.
- **Réutiliser la classe `Component` de Helio.** Aurait créé une dépendance à
  l'interne du thème. L'élément personnalisé est autonome.
- **Superposer le titre sur le comparateur.** Le texte masquerait précisément
  ce que l'image doit démontrer, et le contraste serait ingouvernable sur une
  photo. Le titre est donc **sous** le comparateur, dans la section `accroche`.

### Page d'accueil

Le comparateur ouvre la page en pleine largeur, l'accroche suit. Les images
sont **volontairement vides** : le §11 interdit de laisser du faux contenu en
ligne, le bloc affiche donc ses gabarits jusqu'à ce que les vraies photos
soient choisies dans le personnalisateur.

L'ancien hero est supprimé — et il le fallait : le CSS refondu ne contient plus
le dégradé sombre qui rendait son texte lisible sur l'image.

### Reste en dur sur l'accueil

Les sections héritées portent encore des couleurs de l'ancienne palette mastic
(`#2A2523`, `#EDE7E1`, `#6B625C`, `#F8F5F2`). Elles sont visuellement très
proches des nouvelles et seront reprises au fil des sections. L'ancien accent
`#C9A896`, lui, jurait franchement avec le vert-de-gris : il est déjà basculé
sur `{{ settings.color_palette.color11 }}`.

### À vérifier au premier rendu — comparateur

1. Le bloc `epure-comparateur` apparaît-il bien dans le personnalisateur ?
   Il dépend de `sections/section.liquid` acceptant `@theme`.
2. Le focus clavier est-il visible sur la poignée ? Tester à la tabulation.
3. Le format mobile bascule-t-il bien en portrait sous 750 px ?

---

## Étape 3 — Preuve produit ✅

### Le problème

La section `stats` alignait trois colonnes `01 / 02 / 03`. Deux griefs :

1. Le §6 veut les trois raisons d'acheter « traitées comme du contenu
   (bénéfice concret + justification technique) », pas comme une grille.
2. La numérotation a été explicitement écartée par le commanditaire, sauf
   séquence réelle. Or trois arguments **parallèles** n'en constituent pas
   une : les numéroter suggérait un ordre qui n'existe pas.

### Décidé

Section `preuve` : une **fiche technique en lignes**, pas une grille de
colonnes. Chaque ligne oppose la promesse à sa preuve :

| Étiquette technique (accent) | Bénéfice (h3) | Justification |
|---|---|---|
| Compression dégressive | Il lisse le ventre. | Ferme sur l'abdomen, relâchée vers la cage thoracique. Respiration libre, y compris assise. |
| Tricot renforcé, zéro baleine | Il soutient sans armature. | Le maintien vient de la densité du tricot. Rien ne pique, rien ne marque en fin de journée. |
| Bords laser, maille continue | Il ne se voit pas. | Bords découpés au laser, sans ourlet. Aucune ligne sous une robe près du corps. |

Filets pleine largeur entre les lignes — c'est la rigueur de l'Atelier qui
porte la structure, maintenant que la numérotation est partie.

Répartition 40 / 60 : la promesse tient en une ligne, la preuve a besoin de
place. L'inverse aurait produit une colonne de droite étranglée.

### Écarté

- **Garder trois colonnes en supprimant seulement les numéros.** Aurait
  respecté la lettre de la consigne, pas son intention : trois colonnes de
  texte court restent une grille de fonctionnalités.
- **Des icônes.** Explicitement proscrites par le §6.
- **Un intitulé de section vendeur** (« Trois bonnes raisons »). Le §7 interdit
  les superlatifs creux. Le sur-titre retenu, « Pourquoi ça tient », est une
  question que la cliente se pose réellement.

### À vérifier

Les lignes basculent-elles proprement en colonne sous 750 px ? Le repli
mobile est celui de Helio (`vertical_on_mobile`), non surchargé.

---

## Étape 4 — Bloc matière ✅

### Le grammage manque, et je ne l'invente pas

Le §6 demande « grammage, composition, élasticité ». La composition
(85 % polyamide, 15 % élasthanne) et l'extensibilité figurent dans la fiche
produit du marchand. **Le grammage n'apparaît nulle part.**

Le §11 interdit de laisser du faux contenu en ligne. Un grammage inventé
serait pire qu'une absence : c'est une donnée technique vérifiable, et un
chiffre faux sur une fiche produit engage le vendeur. La ligne est donc
**omise**, à ajouter dès que la valeur réelle sera connue.

### Décidé

Section `matiere` en deux colonnes asymétriques : la prose à gauche (44 %),
la fiche technique à droite (56 %), filets entre chaque entrée.

| Intitulé | Donnée | Source |
|---|---|---|
| Composition | 85 % polyamide, 15 % élasthanne | fiche produit |
| Extensibilité | Bi-extensible, dans les deux sens | fiche produit |
| Finition | Bords découpés au laser, sans ourlet | fiche produit |
| Entretien | 30 °C en filet, séchage à l'air libre | fiche produit |
| ~~Grammage~~ | *inconnu* | — |

C'est la première section à utiliser le **fond sable** (`color2`) : la valeur
chaude réclamée pour éviter l'effet clinique. Elle reste unique sur la page,
sinon elle cesse d'être un accent de rythme.

### Rythme de la page

L'ordre est désormais : comparateur → accroche → preuve → macro maille →
matière → diptyque → pause → éditorial → teintes → produit → quotidien →
clôture.

Trois registres alternent : plein cadre photographique, fiche technique,
bloc centré. Le grief de monotonie portait sur la répétition d'un même
gabarit texte/image : il n'y en a plus deux consécutifs du même type.

### Nettoyage §10 effectué au passage

Les boutons portaient encore des couleurs mastic en dur
(`custom_button_background`, `link_text_color`…). Tous basculés sur
`button-primary`, qui hérite de la palette. Idem pour le sélecteur de
variantes et les champs de la fiche produit intégrée. Restent onze `#645B54`
(encre secondaire) : la palette Shopify n'a pas d'emplacement pour cette
valeur — à corriger en ajoutant `color5` lors d'une passe ultérieure.

### Contrôle

Le fond sable a été vérifié au contraste dès l'étape 1 : encre 11,24 (AAA),
encre-2 4,51 (AA), accent 7,12 (AAA). Aucune paire ne descend sous le seuil.

---

## Étape 5 — Guide des tailles ✅

### Aucune mensuration disponible

Même situation que le grammage : le §6 réclame des « mensurations réelles »,
la fiche produit n'en contient aucune. Le composant est donc bâti pour que
l'absence soit tenable :

- **le conseil de coupe s'affiche toujours** — c'est la seule information
  certaine, et elle vient du marchand : « prenez votre taille habituelle,
  entre deux tailles la plus grande » ;
- **le tableau ne s'affiche que si au moins une mesure est renseignée.** Un
  tableau aux cellules vides serait publié en l'état ; un tableau inventé
  serait faux. Les deux sont pires que son absence.

Les six intitulés de tailles (S → 3XL) sont pré-remplis car ils, eux, sont
réels. Les 18 cellules de mesures sont vides.

### `<dialog>` natif plutôt que le tiroir de Helio

Helio expose `snippets/theme-drawer.liquid` et `assets/theme-drawer.js`.
Écarté au profit de `<dialog>`, qui fournit **nativement** les quatre
exigences du §8 pour les tiroirs : piège de focus, fermeture par Échap,
restauration du focus sur le déclencheur, inertage de l'arrière-plan.
Réimplémenter cela via le tiroir maison aurait ajouté du code pour un
résultat inférieur, et créé une dépendance à l'interne du thème.

Coût : 2,2 Ko de JavaScript, uniquement pour appeler `showModal()`.

### Sans JavaScript

`showModal()` n'étant jamais appelé, le panneau resterait masqué. La feuille
de style le rétablit en flux normal via `@media (scripting: none)`. Le
conseil de coupe figure de toute façon aussi dans l'accordéon « Taille &
coupe » de la fiche produit : l'information n'est jamais perdue.

### À vérifier

L'accès par crochets `block.settings[cle]` — utilisé pour parcourir les six
lignes — doit être confirmé au rendu. En cas d'échec, `a_tableau` reste faux
et le tableau ne s'affiche simplement pas : la dégradation est sûre.

---

## Étape 6 — FAQ et balisage FAQPage ✅

### Décidé

Section `sections/epure-faq.liquid`, huit emplacements de questions dont sept
pré-remplis à partir des seules informations de la fiche produit : invisibilité
sous le vêtement, choix de taille, confort sur la journée, post-partum, délai
de livraison, retours, entretien.

**Accordéon en `<details>`/`<summary>` natif** : zéro JavaScript. Ouverture,
fermeture, navigation clavier et annonce aux lecteurs d'écran sont assurées
par le navigateur. La section fonctionne intégralement si le JS échoue.

**Le JSON-LD est généré depuis les mêmes réglages que l'affichage.** Les deux
ne peuvent donc pas diverger — or c'est exactement la divergence entre balisage
et contenu visible que Google sanctionne.

### Le balisage est désactivable, volontairement

Une case `Publier le balisage FAQPage`, cochée par défaut mais accompagnée
d'un avertissement. Publier un `FAQPage` dont les réponses sont inexactes
expose à une pénalité manuelle : ce doit rester un choix conscient, pas un
réglage subi.

### Détail de mise en page

Titre à gauche, questions à droite, en 4/6 — la même asymétrie que le bloc
matière, pour que la page n'ait qu'une seule logique de grille. Le marqueur
natif du `<summary>` est remplacé par un signe + / − dessiné en CSS, qui
pivote à l'ouverture.

### Nettoyage §10

La fiche produit portait encore toute l'ancienne palette mastic. Balayée :
`#F8F5F2 → #F7F4F0`, `#2A2523 → #221E1C`, `#EDE7E1 → #EFEAE4`,
`#DDD4CC → #7C7671` (filet fonctionnel, seuil 3:1), `#C9A896 → palette color11`.
Corrigé aussi « élastane » en « élasthanne », pour coller à la fiche du marchand.

---

## Comparateur — retiré de la page d'accueil

Les quatre visuels Higgsfield importés le 22 août ont été inspectés via
l'historique de génération. Leurs prompts :

- « genere moi cette image en plus professionel pour ma boutique e commerce
  et plus epuree » (retouche de photos produit)
- « genere le body en marron » / « genere le moi en noir » (déclinaisons)

**Aucune image « sans le body » n'existe dans ce lot.** Toutes montrent le
produit porté. Le commanditaire avait donné carte blanche sur le choix des
images, mais cette confiance supposait qu'une paire valable existe : ce n'est
pas le cas. Deux images du produit porté, étiquetées « Sans le body » et
« Avec le body », auraient été absurdes à l'écran et trompeuses sur le fond.

Le hero repasse donc sur `epure-01-accroche.png` en pleine largeur. Le bloc
`epure-comparateur` reste installé dans le thème et disponible dans le
personnalisateur : il suffira de le rajouter le jour où la paire existera.

Ce qu'il faut photographier : **même personne, même pose, même lumière, même
cadrage, même objectif** — une prise sans le body, une avec. C'est la seule
configuration à la fois lisible à l'écran et défendable juridiquement.

Note technique : ni le CDN Shopify ni celui de Higgsfield ne sont joignables
depuis cette session (403 sur le CONNECT). Les images n'ont jamais pu être
regardées ; seuls leurs prompts de génération étaient accessibles.

---

## Étapes 7 et 8 — Avis clientes et réassurance ✅

### La boutique n'a aucun avis

Vérification faite avant de coder : trois commandes seulement, toutes du
22 août, toutes des tests. Aucun avis client n'existe et aucun n'a été
collecté.

**L'état vide consiste donc à ne rien afficher côté visiteur.** Une section
d'avis qui annonce n'en avoir aucun est une contre-preuve sociale, pas une
preuve. Dans l'éditeur de thème, un repère en pointillés explique en revanche
pourquoi la section est masquée — sinon elle passerait pour cassée.

### Aucun balisage Review ni AggregateRating

Délibéré. Ces témoignages sont saisis par le marchand, pas collectés auprès
d'acheteurs vérifiés. Les publier en données structurées reviendrait à
revendiquer une notation systématique qui n'existe pas — Google le pénalise,
et la mention « avis vérifiés » est contrôlée en France.

Le schema porte un avertissement explicite : publier de faux témoignages est
une pratique commerciale trompeuse, sanctionnée pénalement.

Le §11 interdisant les apps, la collecte réelle d'avis vérifiés supposera un
service dédié le moment venu. C'est le seul point du §6 qu'aucun code ne peut
résoudre à lui seul.

### Réassurance

Quatre colonnes en bas de page : livraison, retours, paiement, contact.
Le §6 la veut « discrète, jamais en bandeau clignotant » — d'où aucune
animation, aucune icône, aucun fond coloré. Un filet supérieur et du texte en
petites capitales.

Les délais proviennent tous de la fiche produit. Un commentaire dans le
fichier rappelle qu'ils doivent être corrigés aux deux endroits en cas de
changement : une réassurance qui contredit la fiche détruit exactement la
confiance qu'elle cherche à établir.

Le lien « Une question ? » pointe vers `/pages/contact` plutôt que vers
l'adresse iCloud personnelle enregistrée comme contact de la boutique — elle
n'a rien à faire en clair sur une vitrine.

---

## À vérifier au premier rendu

Sans accès réseau à la boutique, ces points ne sont pas confirmés :

1. **Suppression des `!important`.** Si Helio pose certaines valeurs en style
   inline, quelques surcharges peuvent ne plus s'appliquer. Le correctif propre
   n'est pas de réintroduire `!important` mais de cibler les propriétés
   personnalisées de Helio — cela suppose de lire
   `snippets/variant-picker-styles.liquid` et `theme-styles-variables.liquid`.
2. **Rendu des polices.** `font-display: swap` : vérifier l'absence de FOUT marqué.
3. **Titres.** Helio tire ses tailles du personnalisateur ; le CSS les réaligne
   sur l'échelle de tokens. À confirmer visuellement.

---

## Limites de l'environnement

- **Lighthouse (§8) et captures 390/1440 px (§9.3) : impossibles ici.** Le proxy
  de la session refuse `dqjm0n-ke.myshopify.com` (403 sur CONNECT). Le code suit
  les règles qui produisent ces scores, mais la mesure doit être faite côté
  client. La case du §10 ne sera pas cochée par mes soins.
- **Avis clients (§6) sans app (§11)** : section alimentée par le
  personnalisateur, avec état vide propre. La collecte réelle exigera une app.

---

## Décision du commanditaire

**Comparateur avant/après avec des images générées par IA.** Le risque a été
signalé puis réaffirmé par le commanditaire : je l'implémente. La mention légale
du §5 et les libellés « Sans le body » / « Avec le body » sont non négociables et
restent en place.

Rappel du cadre : un avant/après **fabriqué** pour un produit gainant constitue
une pratique commerciale trompeuse. Le montage est conforme si les deux images
montrent la même personne, même pose, même lumière, et que seule la présence du
body change. Il ne l'est pas si la silhouette a été affinée.

---

## Reste à faire

- [~] Hero comparateur — composant livré, en attente d'une vraie paire de photos
- [x] Preuve produit
- [x] Bloc matière
- [x] Guide des tailles en tiroir
- [x] FAQ + JSON-LD `FAQPage`
- [x] Avis clients
- [x] Réassurance
- [ ] Remplacer les visuels marketplace (allégations d'amincissement, contraires aux §5 et §10)
- [ ] Passer le français en langue par défaut de la boutique
- [ ] Remplacer « My Store 5 » dans l'en-tête
