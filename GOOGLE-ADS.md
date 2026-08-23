# Épure — dossier Google Ads

Je n'ai pas d'accès à Google Ads depuis cette session : aucun connecteur Google
n'y est branché. Rien de ce qui suit n'a été créé pour vous — tout est à
reporter dans l'interface. En revanche l'audit du flux produit, lui, a été fait
sur vos données réelles.

---

## 1. Le flux produit — audit

### Conforme

| Attribut Google | Source Shopify | Valeur |
|---|---|---|
| `brand` | Fournisseur | Épure |
| `google_product_category` | Catégorie | Vêtements et accessoires > Vêtements > Ensembles une pièce |
| `color` | Option « Couleur » | Nude, Marron, Noir |
| `size` | Option « Taille » | S → 3XL |
| `mpn` | SKU | `EPU-BODY-{taille}-{coloris}` sur les 18 variantes |
| `price` | 54,90 € | identique sur toutes les variantes |
| `availability` | Stock suivi | 161 unités |
| `shipping_weight` | 0,18 kg | renseigné partout |

### Les codes-barres vont vous faire refuser

Les 18 variantes portent un code-barres, et **tous ont une clé de contrôle GS1
mathématiquement valide**. C'est justement ce qui rend le problème discret.

Regardez les préfixes d'entreprise :

| Préfixe | Zone GS1 | Variantes concernées |
|---|---|---|
| `744…` | Costa Rica | 10 |
| `313…` | France | 5 |
| `726…`, `705…` | Norvège | 3 |

Dix-huit variantes **d'un seul et même vêtement**, réparties sur trois pays et
quatre préfixes d'entreprise différents. Un fabricant réel utilise **un seul**
préfixe pour toute sa gamme. Ces codes ont été générés — c'est le comportement
habituel des outils de dropshipping, qui fabriquent des GTIN au format correct
mais non déposés.

Google ne se contente pas de vérifier le format : il confronte chaque GTIN à la
base GS1. Deux issues, toutes deux mauvaises : le produit est refusé pour
« GTIN invalide », ou pire, il est rattaché à un article qui n'a rien à voir.

**Le correctif n'est pas d'inventer de meilleurs codes.** Quand un produit n'a
pas de GTIN authentique, la règle Google est de déclarer `identifier_exists =
non`, et de fournir à la place `brand` + `mpn`. Vous avez les deux : Épure, et
vos SKU.

Concrètement : vider le champ code-barres des 18 variantes, ou exclure
l'attribut du flux dans l'app Google & YouTube.

*Réserve* : je ne sais pas si votre app de dropshipping se sert de ces
codes-barres pour router les commandes. À vérifier avant de les effacer — c'est
pour ça que je ne l'ai pas fait moi-même.

### Deux attributs obligatoires manquent

Pour le prêt-à-porter, Google exige `age_group` et `gender`. Aucun des deux
n'est renseigné — le produit ne porte que deux métachamps, tous deux liés au
référencement.

À définir dans l'app **Google & YouTube** : `age_group = adult`,
`gender = female`.

### Les images

La galerie mélange trois sources et six visuels panoramiques 16:9 affichés dans
un cadre carré. Google refuse par ailleurs toute image portant du texte, un
logo incrusté ou un filigrane promotionnel. À trancher avant de diffuser.

---

## 2. La politique Google qui vise votre catégorie

Le shapewear tombe sous la **publicité personnalisée — catégories sensibles**.
Google interdit les annonces qui jouent sur l'insatisfaction corporelle ou
promettent une transformation du corps.

Ce qui fait refuser un compte dans cette catégorie :

- les avant / après de silhouette ;
- « perdre du ventre », « affiner », « mincir », « -2 tailles » ;
- toute formulation supposant que le corps de la personne pose problème.

Ce qui passe, et que votre site dit déjà : la **construction** du vêtement
(tricot sans couture, bords laser, absence d'armature), son **effet visuel
porté**, son **confort**, sa **gamme de tailles**.

Un point concret : votre produit porte le tag `ventre plat`. Il ne part pas
dans le flux Google comme attribut, mais ne l'employez pas comme mot-clé ni
dans une annonce.

---

## 3. La structure de campagne à créer

**Ne commencez pas par Performance Max.** PMax a besoin de données de
conversion pour apprendre ; sans historique, il dépense en explorant. Vous avez
trois commandes, toutes créées à la main.

### Campagne 1 — Shopping standard

- **Objectif** : ventes · **Type** : Shopping standard (pas PMax)
- **Zone** : France uniquement pour commencer
- **Langue** : français
- **Budget** : 15 €/jour
- **Enchères** : « Maximiser les clics » avec un plafond de CPC à 0,45 € les
  deux premières semaines, puis « ROAS cible » une fois 15 conversions atteintes

Le flux fait le travail : pas d'annonce à rédiger, Google pioche dans le titre,
l'image et le prix. C'est le test le moins cher pour savoir si le produit
intéresse.

### Campagne 2 — Recherche, intention haute

- **Budget** : 10 €/jour · **Enchères** : Maximiser les clics
- Un seul groupe d'annonces, une seule page de destination : la fiche produit

---

## 4. Mots-clés

### À acheter — expression exacte

```
body gainant
body sculptant
body gainant sans couture
body gainant femme
body gainant grande taille
body sculptant sans couture
gaine body femme
body gainant post partum
body gainant invisible
body galbant femme
```

### Négatifs — à mettre dès le premier jour

```
-gratuit          -pas cher         -occasion
-homme            -bébé             -enfant
-avis             -test             -comparatif
-patron           -couture diy      -tuto
-aliexpress       -shein            -temu
-amazon           -vinted           -wish
-location         -grossiste        -en gros
```

Les trois dernières lignes comptent plus que les autres : sans elles, vous
payez le clic de gens qui cherchent votre produit **moins cher ailleurs**.

---

## 5. Annonce responsive — titres et descriptions

Vérifiés sous les limites Google (30 et 90 caractères).

### Titres (15)

```
Body sculptant sans couture
Body gainant du S au 3XL
Tricoté d'une seule pièce
Ni couture, ni armature
Invisible sous le vêtement
Bords découpés au laser
Livraison offerte dès 50 €
Retours sous 14 jours
Six tailles, une seule coupe
Nude, marron ou noir
Maintien ferme et confortable
54,90 € port offert
Le body sans couture Épure
Confortable toute la journée
Guide des tailles détaillé
```

### Descriptions (4)

```
Tricoté d'une seule pièce, sans couture ni armature. Aucune démarcation sous le vêtement.
Du S au 3XL, même coupe et même maintien. Livraison offerte, retours sous 14 jours.
85 % polyamide, 15 % élasthanne. Bords laser, bretelles réglables, zéro baleine.
Compression ferme sur le ventre, libre vers les côtes. Confortable une journée entière.
```

Aucune de ces lignes ne promet un effet durable sur le corps. C'est délibéré :
elles doivent passer la modération Google **et** rester cohérentes avec le
site, qui s'interdit ces allégations partout.

### Extensions à ajouter

- **Liens annexes** : Guide des tailles · Livraison & retours · Nos coloris · Contact
- **Accroches** : Livraison offerte · Retours 14 jours · Du S au 3XL · Sans couture
- **Extraits de site** — type « Types » : Nude, Marron, Noir

---

## 6. Suivi des conversions — à vérifier avant de dépenser

L'app Google & YouTube pose le suivi automatiquement, mais il faut le
contrôler :

1. Dans Google Ads → Objectifs → Conversions, l'action **Achat** doit être en
   catégorie **Principale**. Si elle est en « Secondaire », les enchères
   automatiques ne l'optimisent pas.
2. Une seule action Achat. Un doublon compte chaque vente deux fois et fausse
   tout le ROAS.
3. Passez une commande test et vérifiez qu'elle remonte sous 24 h.

**Sans cette vérification, vous pilotez à l'aveugle** — et les enchères
automatiques optimiseront sur un signal faux.

---

## 7. Dans quel ordre

1. Corriger les mentions légales. Google refuse les comptes sans identification
   complète du vendeur — c'est le premier contrôle.
2. Régler les codes-barres et ajouter `age_group` / `gender`.
3. Passer une commande test : frais de port et remontée de conversion.
4. Lancer le Shopping standard seul, une semaine, 15 €/jour.
5. Ajouter la Recherche seulement si le Shopping ramène des clics à un coût
   tenable.
