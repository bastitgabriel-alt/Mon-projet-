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

- [ ] Hero comparateur (étendre le bloc natif, ne pas le réécrire)
- [ ] Preuve produit
- [ ] Bloc matière
- [ ] Guide des tailles en tiroir
- [ ] FAQ + JSON-LD `FAQPage`
- [ ] Avis clients
- [ ] Réassurance
- [ ] Remplacer les visuels marketplace (allégations d'amincissement, contraires aux §5 et §10)
- [ ] Passer le français en langue par défaut de la boutique
- [ ] Remplacer « My Store 5 » dans l'en-tête
