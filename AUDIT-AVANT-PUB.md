# Épure — audit avant lancement publicitaire

Fait le 23 août, avant tout achat de trafic.

---

## Corrigé

### Frais de port — le point qui coûtait le plus cher

Le profil « AutoDS Free Shipping », qui régit le produit actif, portait des
conditions **inversées** :

| Panier | Port | |
|---|---|---|
| 0 → 34,99 € | 0 € | |
| 35 € et plus | **2,99 €** | ← le produit coûte 54,90 € |

Autrement dit : **toutes** les commandes payaient 2,99 €, alors que le site
promet « Livraison offerte » à six endroits — bandeau d'en-tête, réassurance,
FAQ, accordéon de la fiche, bloc de livraison calculée, argument « Pourquoi
nous choisir ».

Corrigé : les deux tranches sont à **0 €**, dans la zone EU comme en Suisse.
La promesse du site est désormais vraie.

*Réserve honnête* : les trois commandes existantes affichaient déjà 0 € de
port, mais elles ont été créées depuis l'admin (`quick_sale`) et ne portent
aucune ligne de transport — elles ne prouvaient donc rien. **Passer une vraie
commande test depuis la boutique** reste la seule vérification concluante.

### Description produit

Contenait encore « cuisses **affinées** » — l'allégation d'amincissement
retirée du thème mais pas des données produit. Or c'est cette description qui
alimente le flux **Google & YouTube**, sur lequel le produit est publié.
Remplacé par « cuisses lissées ».

Ajouté au passage : les bords découpés au laser dans les détails, et la
mention d'effet en bas de fiche, identique à celle du site.

### SEO du produit

Titre et méta-description étaient vides.

- Titre : `Body sculptant sans couture, du S au 3XL | Épure`
- Description : `Un body tricoté d'une seule pièce, sans couture ni armature. Ventre lissé, dos soutenu, invisible sous le vêtement. Du S au 3XL. Livraison offerte.`

---

## Hors de portée de l'API

`shopPolicyUpdate` exige la portée `write_legal_policies`, que cette session
n'a pas. Les deux politiques ci-dessous doivent être collées à la main dans
**Boutique en ligne → Paramètres → Politiques**.

### Mentions légales — bloquant absolu

Le texte en ligne est un **modèle non rempli**. Les visiteurs lisent, en ce
moment : `Raison sociale : [Nom de votre entreprise…]`, `SIRET : [votre numéro
SIRET]`, `E-mail : [votre adresse e-mail]`.

C'est une obligation de l'article 6 III de la LCEN, c'est la première page que
contrôle la DGCCRF, et **Meta comme Google refusent les comptes** dont les
mentions légales sont incomplètes. Il manque quatre valeurs que seul le
marchand possède : raison sociale, forme juridique, SIRET, TVA
intracommunautaire.

À noter aussi : la vente en ligne aux particuliers oblige à désigner un
**médiateur de la consommation** (article L.612-1) et à en indiquer les
coordonnées. Il faut y adhérer avant de le mentionner — on ne peut pas
l'inventer.

### Politique d'expédition — contredit le site

| | Politique en ligne | Site |
|---|---|---|
| Délai | 7 à 15 jours ouvrés | 10 à 20 jours ouvrés |
| Port | « Livraison standard : 2,99 € » | « Livraison offerte » |

Le texte de remplacement est fourni au marchand.

---

## Vérifié conforme

- Boutique **publiquement accessible** — aucune protection par mot de passe
- Thème **« Épure — atelier » publié** : tout le travail récent est en ligne
- Produit **actif**, 161 en stock, inventaire suivi
- Publié sur **Boutique en ligne** et **Google & YouTube**
- EUR, TVA incluse, fuseau Europe/Paris, forfait Basic
- Les **sept politiques existent** (deux à corriger)
- Paiement fonctionnel — trois commandes réglées

---

## Reste à faire, côté marchand

1. Coller les deux politiques.
2. Passer une commande test réelle pour confirmer les frais de port à 0 €.
3. Remplacer l'adresse `bastitgabriel@icloud.com` par un contact de marque —
   elle sert aujourd'hui de contact public dans les politiques et la fiche.
4. Prendre un nom de domaine. `epure-market.myshopify.com` coûte en confiance
   à l'endroit précis où le trafic est payé.
5. Trancher sur la galerie produit : six visuels `epure-0X` en 16:9 s'affichent
   en bande dans une galerie carrée. Les en retirer ne demande aucune
   génération d'image.
