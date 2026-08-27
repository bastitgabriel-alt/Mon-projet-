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
| ~~Grammage~~ | *abandonné — introuvable côté fournisseur* | — |

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

### Aucune mensuration disponible — puis si, finalement

À la conception, le §6 réclamait des « mensurations réelles » que la fiche
produit ne contenait pas. Le composant a donc été bâti pour que l'absence
soit tenable :

- **le conseil de coupe s'affiche toujours** — c'est la seule information
  certaine, et elle vient du marchand : « prenez votre taille habituelle,
  entre deux tailles la plus grande » ;
- **le tableau ne s'affiche que si au moins une mesure est renseignée.** Un
  tableau aux cellules vides serait publié en l'état ; un tableau inventé
  serait faux. Les deux sont pires que son absence.

Cette dégradation gracieuse a servi : les 18 cellules sont restées vides
jusqu'à ce que le marchand retrouve la fiche du fournisseur.

### Mensurations renseignées (source : fiche fournisseur)

Le SIZE CHART du fournisseur (marque *miss moly*, modèle 0047) donne les
mesures **du corps**, en centimètres :

| Taille | Poitrine | Taille | Hanches | Longueur du vêtement |
|---|---|---|---|---|
| S | 87-92 | 66-71 | 92-97 | 37 |
| M | 92-97 | 71-76 | 97-102 | 38 |
| L | 97-102 | 76-81 | 102-107 | 39 |
| XL | 102-107 | 81-86 | 107-112 | 40 |
| 2XL | 107-112 | 86-91 | 112-117 | 41 |
| 3XL | 112-117 | 91-96 | 117-122 | 42 |

Les 18 cellules sont remplies, le tableau s'affiche donc désormais. La
longueur du vêtement n'entre pas dans le tableau — ce n'est pas une mesure
de corps, on ne la compare pas à la sienne. Elle passe en note sous le
tableau, où elle informe sans induire en erreur.

**Les bornes se chevauchent** (92 termine le S et ouvre le M, etc.). C'est
la grille du fournisseur, je ne la corrige pas : le conseil « entre deux
tailles, prenez la plus grande » couvre exactement ce cas, et il est déjà
affiché juste au-dessus du tableau.

### Grammage : abandonné

Le §6 le demandait ; il n'apparaît ni sur la fiche du marchand, ni dans le
tableau de spécifications du fournisseur, qui ne mentionne aucun GSM.
Le marchand a tranché : on laisse tomber. La ligne reste omise plutôt
qu'inventée (§11).

### Formulation corrigée au passage

L'accordéon « Ce qu'il fait » portait « cuisses affinées ». *Affiner*
suggère un amincissement, donc un effet durable sur le corps — ce que le
§10 interdit d'affirmer. Remplacé par « cuisses lissées », qui décrit
l'effet visuel porté, et rien de plus.

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
- [x] Passer le français en langue par défaut de la boutique — fait côté marchand
- [x] Remplacer « My Store 5 » dans l'en-tête — la boutique s'appelle « Epure »
- [x] Correspondance tailles FR
- [x] Bloc morphologie (effet selon la tenue portée)
- [x] Livraison estimée calculée en Liquid
- [~] `alt` des visuels — 3 écrits (variantes de couleur), 12 hors de portée sans voir les images
- [ ] Retirer de la galerie produit les 6 `epure-0X.png` qui doublonnent les fonds de section
- [x] Publier « Épure — chantier » — fait côté marchand
- [x] Publier « Épure — atelier » — fait côté marchand
- [ ] Republier « Épure — atelier » (section « Pourquoi nous choisir »)
- [x] Ménage des thèmes — il ne reste que « atelier » et « chantier »

---

## Bandeau défilant au-dessus du menu — 23 août

### Le thème l'interdisait

La bande avait été ajoutée en haut de la page d'accueil. Elle s'affichait donc
**sous** l'en-tête, puisque l'accueil est le corps de la page. La déplacer dans
`sections/header-group.json` échoue : le schema de `sections/marquee.liquid`
porte

```json
"disabled_on": { "groups": ["header", "footer"] }
```

La seule section que Helio autorise au-dessus du menu est
`header-announcements`, qui **ne défile pas** — elle enchaîne des fondus, avec
des flèches.

### Décidé

Une section `epure-bandeau` qui rend exactement le même `<marquee-component>`,
avec les mêmes classes, le même `marquee.js` et les mêmes réglages que la
section native. Elle lève une seule chose : la restriction de groupe.

Aucun JavaScript ajouté. Le CSS est repris dans la section plutôt que laissé au
groupement du thème : quelques centaines d'octets contre la certitude que le
bandeau garde sa mise en forme même si la section native n'est rendue nulle
part sur la page. Les déclarations étant identiques, la coexistence des deux
sections ne produit aucun conflit.

L'animation reste conditionnée à `prefers-reduced-motion: no-preference`,
comme dans la section d'origine.

### Écarté

- **La barre d'annonce native.** Zéro ligne de code, autorisée au-dessus du
  menu — mais elle ne défile pas. Ce n'est pas ce qui était demandé.
- **Laisser la bande en haut de l'accueil.** Elle n'aurait été visible que sur
  l'accueil, et sous le menu.

### Contenu repris

La bande portait le texte de démonstration de Shopify : *« Nous fabriquons des
articles plus performants et plus durables. »* Deux problèmes — c'est du
contenu de démo laissé en ligne (§11), et Épure ne fabrique rien : le body
vient d'un fournisseur. Remplacé par quatre mentions vraies, tirées de la fiche
du marchand : livraison offerte, retours sous 14 jours, du S au 3XL, maille
tricotée sans couture.

Le fond était `#d8e8d5`, un vert d'eau hors palette et codé en dur (§10).
Basculé sur le sable (`color2`) : encre sur sable tient 11,24, soit AAA.
Hauteur ramenée de 24 px à 10 px et corps de 1 rem à 0,8125 rem en petites
capitales — un bandeau de service se lit, il ne s'impose pas.

### Nettoyage §10 au passage

Trois `#2a2523` traînaient dans les réglages d'en-tête transparent
(`text_color_transparent_home`, `_product`, `_collection`). Renvoyés vers
`foreground`.

### Attention au circuit

Le thème publié ne peut plus être écrit par l'API. Publier le brouillon oblige
donc à en dupliquer un nouveau à chaque fois, et les thèmes s'accumulent.
Le circuit sain : garder **un** brouillon de travail permanent, et publier une
copie plutôt que le brouillon lui-même.

---

## Audit complet contre le brief — 23 août

Repris section par section, contre l'état réel lu par l'API Admin.

### Le thème a été publié

« Épure — test » est passé en `MAIN` ; Helio est repassé en `UNPUBLISHED`.
Conséquence directe : **l'API refuse désormais toute écriture sur ce thème.**
La garde est saine — on n'édite pas une vitrine ouverte — mais elle impose un
nouveau circuit : duplication en brouillon, travail sur le brouillon,
publication par le marchand.

Le brouillon de travail est **« Épure — chantier »** (`190584619332`).

### §10 — critère « aucune couleur en dur » : il échouait

42 valeurs hexadécimales vivaient hors du fichier de tokens :

| Emplacement | Nb | Détail |
|---|---|---|
| `templates/index.json` | 15 | dont un `#6B625C` orphelin |
| `templates/product.…json` | 15 | |
| `config/settings_data.json` | 12 | badges, tiroir, popovers, champs |

La cause était structurelle : la palette Shopify n'avait **pas d'emplacement**
pour l'encre secondaire ni pour la ligne forte — les slots `color5` et `color6`
étaient vides. Faute de slot, chaque section réécrivait la valeur à la main.

Corrigé en ouvrant les deux slots :

```
color5 = #645B54   encre secondaire
color6 = #7C7671   ligne forte (seuil 3:1)
```

Les 42 valeurs renvoient maintenant vers la palette. Zéro hex hors tokens et
hors définition de palette.

Le `#6B625C` orphelin méritait un mot : il n'appartenait à aucun système.
Contrôle fait — 4,98 sur le fond, donc **il ne cassait pas l'AA** ; il aurait
échoué (4,05) sur le fond sable, où il ne se trouvait pas. Normalisé sur
`color5`, qui tient partout.

### §8 — une police inutile était préchargée

Les quatre sélecteurs de Helio (`type_body_font`, `type_subheading_font`,
`type_heading_font`, `type_accent_font`) pointaient tous sur `inter_n4`.
Or `snippets/fonts.liquid` fait un `preload_tag` sur chacun : Inter était donc
**téléchargée à chaque page** — et jamais affichée, puisque les tokens
imposent nos deux familles auto-hébergées. Un `preload` force la requête, il
n'attend pas qu'un élément réclame la police.

Corrigé en basculant les quatre sur `system_ui_n4`. La garde native de Helio
(`{%- unless … .system? -%}`) saute alors le préchargement, et `font_face` ne
rend rien pour une police système. Aucun fichier de thème modifié : ce sont
des réglages, réversibles depuis le personnalisateur.

### Écarts au brief encore ouverts

| §  | Attendu | État |
|---|---|---|
| 5 | Comparateur en place | composant livré, hors page — pas de vraie paire de photos |
| 8 | Seuils Lighthouse, captures à l'appui | non mesurable ici (voir Limites) |

---

## Reprise des quatre écarts — 23 août

### §6 — Correspondance tailles FR

Le guide gagne une quatrième colonne, facultative : elle n'apparaît que si au
moins une correspondance est saisie, et ne reçoit jamais l'unité — une taille
française n'est pas une mesure en centimètres.

La correspondance est **dérivée, pas devinée**. Méthode : pour chaque taille
fournisseur, on retient les tailles FR dont les mesures de référence
(NF G03-001, valeurs usuelles du prêt-à-porter femme) tombent à l'intérieur de
la fourchette annoncée, sur les trois mesures.

| Taille | Poitrine | Taille | Hanches | → FR retenu |
|---|---|---|---|---|
| S | 38 | 36-38 | 36-38 | **36-38** |
| M | 40 | 38-40 | 40 | **38-40** |
| L | 42-44 | 42 | 42 | **42-44** |
| XL | 44-46 | 44 | 44-46 | **44-46** |
| 2XL | 48 | 46-48 | 46-48 | **46-48** |
| 3XL | 50 | 48-50 | 50 | **48-50** |

Les trois mesures ne concordent pas toujours — la poitrine tire vers le haut,
la taille vers le bas. C'est le propre des grilles de marketplace. On publie
donc l'union des trois plutôt qu'une taille unique, et la note sous le tableau
tranche explicitement : « la correspondance FR est indicative — en cas
d'écart, fiez-vous aux centimètres ». Une fourchette honnête vaut mieux qu'un
chiffre faussement précis.

### §6 — Effet selon la tenue portée

Nouvelle section `epure-morphologie`, placée juste après l'image pleine
largeur du body porté : on montre, puis on explique.

L'objection visée est « il va se voir ». Elle ne se règle pas par une promesse
générale mais tenue par tenue, parce que c'est ainsi qu'elle se pose — devant
une penderie, pas devant une fiche technique. Quatre entrées par défaut : robe
fluide, jean taille haute, maille fine, chemise ajustée.

**Cette section utilise de vrais blocs Shopify**, contrairement aux sections
Épure précédentes qui reposent sur des emplacements numérotés en dur. Le §3
demande des sections « réordonnables, supprimables » : seuls de vrais blocs le
permettent. Les emplacements fixes de `epure-faq`, `epure-avis` et
`epure-reassurance` restent un compromis à reprendre.

### §6 — Livraison estimée calculée en Liquid

Nouveau bloc `epure-livraison`, qui remplace la ligne statique « Livraison
offerte — Retours sous 14 jours » : elle disait la même chose en moins précis,
et deux lignes qui se recouvrent valent moins qu'une seule.

Compter en jours ouvrés impose de sauter les week-ends. Liquid n'a pas de
boucle conditionnelle, mais le problème se résout en arithmétique entière :

```
semaines pleines = n / 5   →  chacune vaut 7 jours calendaires
reste            = n % 5   →  jours ouvrés restants dans la semaine
si (jour de départ + reste) dépasse le vendredi, ajouter 2 jours
```

Le départ est d'abord repoussé au lundi si la commande tombe un samedi ou un
dimanche. **Vérifié contre un comptage naïf jour par jour sur 2 597 cas**
(371 dates de départ × 7 durées) : zéro écart.

Les jours fériés ne sont pas exclus — les intégrer supposerait une table à
maintenir chaque année, pour un écart d'un jour sur une fenêtre qui en compte
déjà dix. La mention dit « estimation », jamais un engagement.

Calcul côté serveur, sans JavaScript : pas de saut de mise en page, pas de
dépendance au fuseau du visiteur. Les noms de mois sont posés dans le fichier
plutôt que laissés à `%B`, dont la locale n'est pas garantie française.

### §8 — Textes alternatifs : fait pour trois, impossible pour douze

Le CDN Shopify **et** celui de Higgsfield sont refusés par le proxy de la
session. J'ai essayé les deux, ainsi que l'historique de génération Higgsfield :
les prompts sont de l'image-à-image générique (« genere moi cette image en plus
professionel pour ma boutique e commerce »), ils ne décrivent pas le contenu.

**Je ne vois aucune de ces quinze images.** Écrire un `alt` sur une image non
vue produirait une description confiante et fausse — pour un lecteur d'écran,
c'est pire qu'un `alt` vide.

Une piste s'est révélée vérifiable : Shopify rattache trois visuels à une
variante de couleur. Cette information vient de la boutique, pas d'une
supposition. Les trois `alt` sont donc écrits :

| Média | Variante | `alt` |
|---|---|---|
| 71349735227716 | Nude | Body sculptant sans couture Épure porté, coloris Nude |
| 71349735457092 | Marron | …coloris Marron |
| 71349735489860 | Noir | …coloris Noir |

Restent douze visuels sans `alt` exploitable. Deux observations pour la suite :

- **six sont des doublons.** Les `epure-0X.png` de la galerie produit servent
  déjà de fonds de section pleine largeur sur la même page. Le client les voit
  deux fois. Le correctif n'est pas d'écrire leur `alt`, c'est de les retirer
  de la galerie — décision du marchand, sur une boutique en ligne.
- **côté thème, le §8 est tenu.** Les images de fond de section sont
  décoratives, le sens étant porté par le texte adjacent : un `alt` vide est la
  bonne réponse, et c'est ce qui est en place. L'écart est entièrement dans les
  données produit.

### À vérifier au premier rendu (ajouts du jour)

1. **Fenêtre de livraison.** L'arithmétique est prouvée, le rendu ne l'est pas :
   confirmer que les dates s'affichent en français et que la ligne tient sur une
   seule ligne en 390 px.
2. **Quatrième colonne du guide.** Cinq colonnes dans un tiroir de 30 rem :
   vérifier que le tableau ne déborde pas sur mobile.
3. **Section morphologie.** Confirmer le passage à une colonne sous 750 px.

### Vérifié conforme

- §5 — le comparateur porte `aria-label`, la poignée est masquée aux lecteurs
  d'écran, `role="slider"` et `aria-valuenow` viennent de l'`<input type="range">`
  natif, `Origine`/`Fin` et les flèches fonctionnent sans code.
- §3 — `image_tag` avec `widths`, `loading` et `fetchpriority` sur les deux
  images du comparateur.
- §6 — la barre d'ajout au panier collante est native (`sticky-add-to-cart.js`),
  activée, pilotée par `IntersectionObserver` sur le bloc d'achat, masquée au
  pied de page, et suit les changements de variante. Reste à confirmer
  visuellement qu'elle est bien cantonnée au mobile.
- §3 — aucun hex en dur dans mes fichiers Liquid.
- §11 — aucune app, aucun script tiers ajouté.


---

## Section « Pourquoi nous choisir » — 23 août

Trois arguments, puis un tableau comparatif. Deux registres dans une même
section parce qu'ils répondent à deux questions distinctes : les arguments à
« pourquoi cette boutique », le tableau à « en quoi c'est différent d'un autre
gainant ».

### Le choix du deuxième argument

Le marchand a fixé le premier (qualité premium) et le troisième (livraison
suivie), et m'a laissé le deuxième. Le §1 pose trois objections : est-ce que ça
marche, est-ce confortable, puis-je faire confiance. Les deux arguments imposés
couvrent la première et la troisième — le deuxième est donc **le confort**,
sinon l'objection la plus fréquente restait sans réponse dans ce bloc.

### Le tableau : trois précautions structurelles

C'est une comparaison au sens de l'article L.122-1 du Code de la consommation.
D'où :

1. **La colonne de référence désigne une catégorie de fabrication** — « un
   gainant à coutures » — jamais une marque. Nommer un concurrent obligerait à
   prouver chaque ligne sur ce produit précis, ce que personne ici ne peut
   faire.
2. **Chaque ligne compare une caractéristique vérifiable sur le vêtement** :
   construction, bords, maintien, rendu sous le vêtement, tailles. Aucun
   jugement de valeur, aucune performance chiffrée invérifiable.
3. **La mention rappelant les deux points est dans le schema**, avec une valeur
   par défaut, et non codée en dur — elle reste donc modifiable sans toucher au
   fichier, et ne peut pas disparaître par inadvertance.

Le schema le rappelle au marchand à l'endroit où il serait tenté de saisir un
nom de marque.

### Mise en forme

La colonne Épure est la seule marquée, par un filet vertical à l'accent : pas
de fond teinté, pas de coche verte. Le tableau défile horizontalement dans son
propre conteneur si trois colonnes ne tiennent pas.

### Reprise des modifications de l'éditeur

Le marchand avait, entre-temps : retiré la section produit de l'accueil, et
repassé l'éditorial en colonne (image à 55 %, texte avant image, bouton
secondaire « Découvrir le produit »). Vérifié réglage par réglage avant
d'écrire — 384 identiques, 10 modifiés, 1 section supprimée — puis tout repris.

Le `#221e1c` saisi à la main dans l'éditeur vaut exactement `foreground` :
renvoyé vers la palette, rendu identique, §10 tenu.

**L'accueil n'a plus de bloc d'achat direct.** Les boutons mènent à la fiche
produit. C'est un parti pris défendable, mais il vaut d'être su.

### Circuit

Le thème publié est verrouillé en écriture par l'API. Plus de duplication : on
alterne entre « atelier » et « chantier ». Pour cette section, atelier a été
dépublié le temps de l'écriture, puis republié.


---

## Boutons de la page d'accueil — 23 août

### Ce que j'ai cassé, et pourquoi

Le marchand avait ajouté un bouton sur le hero. Mon envoi suivant l'a effacé.

La cause n'est pas un oubli mais une **erreur de méthode**. Je comparais sa
version à la mienne et je classais les clés en trois tas : identiques,
modifiées, perdues. Les clés **ajoutées** de son côté, je les rangeais en bloc
sous « valeurs par défaut réécrites par l'éditeur » — sans les regarder. Or un
bloc bouton entier arrive précisément comme un ajout. Mon contrôle disait
« 0 modifié, 0 perdu » et il avait raison : il ne regardait pas au bon endroit.

**Règle désormais : on part du fichier du marchand, jamais de la copie locale.**
On le récupère juste avant d'écrire, on y ajoute, on le renvoie tel quel — même
si c'est 59 Ko au lieu de 14. Et on vérifie après coup en recomparant clé par
clé : 2 173 attendues, 2 173 reçues, zéro écart.

### Un lien mort trouvé au passage

Le bouton du hero pointait vers `body-sculptant-sans-couture-epure` — le
produit **archivé**. Tous les autres liens de la page visent
`…-epure-1`, l'actif. Le premier appel à l'action de la page menait donc dans
le vide. Corrigé.

### Boutons en place

| Section | Libellé | Style |
|---|---|---|
| hero | Découvrir le produit | secondaire |
| accroche | Découvrir le body | principal |
| respire1 | Voir la matière | secondaire |
| matière | Voir la fiche produit | principal |
| éditorial | Découvrir le produit | secondaire |
| teintes | Choisir ma teinte | principal |
| pourquoi | Découvrir le body | principal |
| respire2 | Découvrir le body | secondaire |
| clôture | Découvrir le body | principal |

Convention retenue : **secondaire sur les photos pleine largeur**, en écho au
choix du marchand sur le hero ; **principal sur les fonds unis**. Les libellés
varient selon le contexte plutôt que de répéter neuf fois la même formule.

Écartés volontairement : le diptyque (deux carrés jointifs, un bouton y serait
à l'étroit) et la pause (une phrase manifeste seule au centre — un bouton la
tuerait).

La section « Pourquoi nous choisir » reçoit deux réglages, `bouton_libelle` et
`bouton_lien` : le bouton ne se rend que si les deux sont remplis, et se place
après le tableau, là où la décision se prend.

### Réserve

Neuf appels à l'action sur une page, c'est beaucoup au regard du §4, qui
demande de la retenue. C'est une demande explicite du commanditaire, elle est
appliquée telle quelle. À surveiller au rendu : le contraste des boutons
secondaires sur les photos, qui n'ont pas de voile (`toggle_overlay: false`).

---

## 24 août — commande test : code promo interne

### Constat préalable : la commande #1003 n'est pas une vente

Repérée en vérifiant avant de créer le code. Elle ressemble à une vraie
commande (22 août, 54,90 €, payée) mais elle n'en est pas une :

| Champ | Valeur |
|---|---|
| `customer` | `null` |
| `email` | `null` |
| `shippingAddress` | `null` |
| `shippingLines` | vide |
| passerelle | `manual` |

Comme #1001 et #1002, elle a été créée depuis l'admin et marquée payée à la
main. **Zéro passage réel en caisse à ce jour** : les frais de port à 0 €, le
pixel de conversion et la page de remerciement n'ont jamais été traversés.

### Le code créé

`discountCodeBasicCreate` — code `TEST-EPURE-9K4M2X`, 90 %, limité au produit
actif (`gid://shopify/Product/15632004907332`).

Trois garde-fous, ajoutés délibérément :

- `usageLimit: 1` — une seule utilisation, tous clients confondus ;
- `appliesOncePerCustomer: true` ;
- `endsAt` au 31 août — expire seul si le marchand oublie de le supprimer.

Ils comptent : le tunnel n'accepte pas de restreindre un code à une personne,
donc un −90 % sur l'unique produit de la boutique est exploitable par
quiconque le trouve. La limite à 1 usage est ce qui rend le risque nul.

### Pourquoi 90 % et pas 100 %

À 0 € de total, Shopify **saute entièrement l'étape de paiement**. Or c'est
précisément l'étape à vérifier. À 90 %, il reste 5,49 € à régler : le tunnel
est traversé en entier, la conversion remonte avec une valeur réelle, et
l'expédition se déclenche.

### Réserve non levée

Impossible de vérifier depuis l'API si l'app AutoDS est réglée en commande
automatique chez le fournisseur. Si elle l'est, la commande test partira seule
et la carte du marchand sera débitée du prix fournisseur — comportement voulu
ici, mais à connaître avant.

---

## 26 août — deux bugs d'affichage mobile

Signalés par le marchand sur captures iPhone. Diagnostic fait en lisant le
thème en ligne, pas en interprétant les captures.

### Bug 1 — section « editorial » : image en bande

`background_image_position` était réglé sur `'fit'`. Sur les quatre sections
à image de fond de la page d'accueil, c'était **la seule** :

| Section | position | hauteur |
|---|---|---|
| hero | `cover` | large |
| respire1 | `cover` | large |
| respire2 | `cover` | large |
| **editorial** | **`fit`** | **full-screen** |

`fit` = image entière visible. Une image 16:9 dans une section réglée en
`full-screen` sur mobile se réduit donc à une bande horizontale, le texte
débordant au-dessus et en dessous. Corrigé en `cover`.

**Correction d'un diagnostic erroné de ma part** : j'avais annoncé au
marchand que le bloc image `img`, qui porte la même image que le fond,
ajoutait une seconde bande. C'était faux — le diff a montré
`blocks.img.disabled = true`. Ce bloc ne rendait rien. La bande venait
**uniquement** du réglage `fit`. Le bloc a quand même été supprimé : c'est un
doublon inactif du fond de section, mais c'est du nettoyage, pas le correctif.

### Bug 2 — diptyque : recadrage carré

Les deux blocs image étaient en `image_ratio: 'square'`. `blocks/image.liquid`
mappe les valeurs ainsi :

```liquid
when 'landscape' → 16 / 9
when 'portrait'  → 4 / 5
when 'adapt'     → ratio natif
{# défaut : 1 #}
```
```css
.image-block__image { object-fit: cover; aspect-ratio: var(--ratio); }
```

`object-fit: cover` dans un cadre carré recadre au centre et jette le reste —
d'où le menton coupé sur `epure-08-profil..png`. Passés en `portrait` (4/5).

**Pourquoi pas `adapt`** : les deux images n'ont pas le même ratio natif, le
diptyque serait devenu asymétrique. `portrait` les aligne et convient à une
silhouette debout.

### Méthode d'envoi

« atelier » étant le thème publié, l'API refuse l'écriture. Le marchand l'a
dépublié le temps de l'opération — « chantier » a alors servi le site.

Le fichier fait 104 Ko : l'éditeur de thème a déployé tous les réglages par
défaut. Envoyé minifié (58 Ko), puis vérifié par diff clé par clé :

- **original → en ligne** : uniquement les 4 changements voulus, plus les
  20 clés du bloc `img` supprimé ;
- **voulu → en ligne** : **2 212 / 2 212 clés identiques, aucun écart.**

### Constat non traité

`sections.editorial.blocks.t` et `.p` portent `text_color: "#221e1c"`, en dur.
C'est une régression du §10 (toutes les couleurs par jetons) — 42 occurrences
avaient été corrigées le 23 août. Non touché ici : sans connaître la valeur
exacte de `color_palette.foreground`, un remplacement changerait peut-être le
rendu. À trancher séparément.

### Diptyque — arbitrage confirmé par le marchand

Les deux images ont des orientations opposées : `epure-03-sous-vetement`
est en 768×1376 (verticale), `epure-08-profil` en 1376×768 (horizontale).
Comme les panneaux se touchent (`gap: 4`), ils doivent partager le même
cadre — aucun format ne flatte les deux.

| Cadre | Photo verticale | Photo horizontale |
|---|---|---|
| Carré (avant) | 56 % visible | 56 % visible |
| Portrait 4:5 (retenu) | **70 %** | **45 %** |

Le marchand a confirmé que les côtés de la photo horizontale ne portent rien
d'important. Le cadre `portrait` est donc conservé : le rognage latéral ne
coûte que du fond, et la photo verticale y gagne 14 points.

**Second diagnostic erroné à corriger** : j'avais annoncé que le cadre carré
coupait le haut du visage. Faux — avec une source horizontale dans un cadre
carré, `object-fit: cover` rogne **les côtés**, la hauteur reste entière. Le
cadrage serré du visage vient de l'image source. Le réglage n'y était pour
rien.

Vrai correctif à terme : une photo verticale pour l'emplacement b, quand les
vraies prises de vue seront disponibles.

---

## 26 août — dossier Meta Ads

Publié comme page consultable plutôt que comme fichier : le marchand avait
signalé le 24 août qu'il ne pouvait pas ouvrir mes fichiers locaux.

→ https://claude.ai/code/artifact/cb184b3a-2ad6-46ee-8fdc-0621c8de1e55

### Ce qui distingue ce dossier de celui de Google

Le dossier Google du 23 août partait d'un audit de flux produit. Celui-ci
part de la **marge réelle**, connue depuis le 25 août seulement :

```
54,90 €  encaissé
− 1,07 €  Shopify Payments (1,5 % + 0,25 €, lu sur la transaction #Epure1005)
−14,10 €  coût d'achat AliExpress (montant réel payé par le marchand)
=39,73 €  marge brute — coefficient 3,9×, 72 % de marge
```

Seuils qui en découlent, et qui gouvernent tout le document :

| Seuil | Valeur | Origine |
|---|---|---|
| Plafond absolu | 39,73 € | marge brute |
| Équilibre réel | ~34 € | après 8 % de retours + abonnements |
| Cible | < 20 € | ROAS 2,75 |

### Recommandations structurantes

- **Audience large, pas de centres d'intérêt.** À 20 €/jour, découper
  fragmente les conversions et fait payer la phase d'apprentissage plusieurs
  fois. La variable à tester est la créa, pas l'audience — d'où trois
  publicités dans un ensemble unique.
- **Pas d'Advantage+ au départ.** Un seul achat réel dans l'historique, et
  c'est celui du marchand à 8,48 €. Rien sur quoi s'appuyer.
- **Carrousel plutôt que vidéo** pour démarrer : l'argument est technique et
  se démontre vignette par vignette, et ça ne demande pas de caméra.
- **API Conversions non négociable** : sans elle, l'audience large ne
  converge sur rien.

### Deux points de conformité intégrés

1. **Étiquetage IA** — obligatoire depuis le 2 août 2026 (article 50 du
   règlement européen sur l'IA) pour toute création générée ou fortement
   modifiée par IA. Vérifié par recherche web ce jour ; ce n'était pas dans
   mon horizon de connaissances.
2. **Politiques Meta sur le gainant** — trois angles distincts : image du
   corps, attributs personnels (le « vous » qui décrit le corps du lecteur),
   et contenu pour adultes (un cadrage serré sur une zone du corps en
   sous-vêtement). Présentés comme la forme des règles, avec réserve
   explicite : leur texte exact fait foi et évolue.

### Bloquants nommés

Mentions légales non remplies et absence de domaine — les deux empêchent
respectivement l'approbation du compte et la vérification de domaine, donc
l'attribution des conversions.
