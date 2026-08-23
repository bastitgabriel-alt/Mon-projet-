# Épure — prompts d'images pour Higgsfield

Série pensée pour la fiche produit. Les prompts sont en anglais : les modèles
d'image y adhèrent nettement mieux qu'au français, en particulier sur les
termes techniques de lumière et d'optique.

---

## 1. Le bloc de style — à coller dans **chaque** prompt

C'est lui qui fait tenir la série ensemble. Ne le modifiez pas d'une image à
l'autre, sinon les visuels ne sembleront plus venir de la même marque.

```
STYLE: editorial product photography for a French premium shapewear brand.
Seamless warm off-white plaster backdrop, hex #EFEAE4, no gradient, no vignette.
Single large diffused north-facing daylight source from the left, soft falloff,
gentle shadows, no hard shadow edges, no rim light, no studio strobe look.
Warm neutral colour grade, low saturation, no teal-and-orange grade.
Shot on medium format, 85mm equivalent, f/4, shallow but not blurry.
Composition: strict verticals, generous negative space, calm and precise.
No props, no plants, no furniture, no jewellery, no text, no logo, no watermark.
```

**Pourquoi ces choix.** La direction artistique du site repose sur le vide et
la précision, pas sur les ombres portées ni les dégradés — d'où la lumière
unique et diffuse, et le fond strictement uni. Le `#EFEAE4` est exactement le
fond de la boutique : les images se poseront sur la page sans raccord visible.

---

## 2. Le produit, décrit avec exactitude

À reprendre mot pour mot dans les prompts. **Ne l'enjolivez pas** : une image
qui montre un vêtement différent de celui livré est une publicité trompeuse.

```
PRODUCT: a seamless shaping bodysuit, knitted in one piece, 85% polyamide
15% elastane. Matte finish, fine dense knit. Laser-cut edges at the thighs
and shoulders — no hem, no seam, no elastic band. Thin adjustable shoulder
straps with small flat sliders. No underwire, no boning, no closure, no lace,
no logo, no decorative panel.
```

Trois coloris réels : **Nude** (beige rosé), **Marron** (brun tiède),
**Noir**.

---

## 3. Les neuf plans

### 3.1 — Porté de face · image principale de la galerie · carré 1:1

```
[STYLE] [PRODUCT]
A woman in her early thirties standing relaxed, facing camera, wearing the
Nude bodysuit. Natural body, unretouched skin texture, visible pores and
fine lines. Arms relaxed at her sides. Framed from mid-thigh to just above
the head, centred, wide margins on both sides. Neutral calm expression.
Square 1:1 crop.
```

### 3.2 — Porté de dos · carré 1:1

```
[STYLE] [PRODUCT]
Same woman, same Nude bodysuit, seen from behind, standing still.
Shows the uninterrupted back panel and the thin adjustable straps.
Framed from mid-thigh to just above the head. Square 1:1 crop.
```

### 3.3 — Profil · carré 1:1

```
[STYLE] [PRODUCT]
Same woman, same Nude bodysuit, strict side profile, standing still,
one arm relaxed. Shows the clean silhouette of the garment edge along the
hip and thigh. Square 1:1 crop.
```

### 3.4 — Macro de la maille · paysage 16:9 · fond de section

```
[STYLE] [PRODUCT]
Extreme macro of the knitted fabric surface, filling the frame.
The fine continuous knit structure is sharply visible, matte, slightly
elastic, stretched flat. Nude colourway. No body visible, no edge, no seam.
Landscape 16:9 crop.
```

### 3.5 — Bord découpé au laser · carré 1:1

```
[STYLE] [PRODUCT]
Close-up on the thigh opening of the bodysuit worn on a body.
The laser-cut edge lies completely flat against the skin — no hem, no
stitching, no elastic ridge, no mark on the skin. Shallow depth of field,
the edge in sharp focus. Square 1:1 crop.
```

### 3.6 — Bretelle réglable · carré 1:1

```
[STYLE] [PRODUCT]
Close-up on the shoulder of the bodysuit worn on a body: the thin adjustable
strap and its small flat slider, resting on the collarbone. No underwire,
no lace, no decoration. Shallow depth of field. Square 1:1 crop.
```

### 3.7 — À plat, sans corps · carré 1:1

```
[STYLE] [PRODUCT]
The bodysuit alone, laid perfectly flat on the plaster backdrop, seen from
directly above, straps neatly extended, no folds, no hanger, no mannequin.
Nude colourway. Centred, generous margins. Square 1:1 crop.
```

*Le plan qui manque le plus à la fiche.* Il montre l'objet lui-même, sans
interprétation — c'est le plan qui inspire confiance sur une pièce technique.

### 3.8 — Sous un vêtement · paysage 16:9 · fond de section

```
[STYLE] [PRODUCT]
The same woman wearing a loose ecru linen shirt, unbuttoned, over the Nude
bodysuit. The camera catches the moment the shirt opens: the bodysuit is
visible underneath, and the fabric of the shirt falls without catching.
No visible line at the thigh through the fabric. Landscape 16:9 crop.
```

### 3.9 — Les trois coloris · paysage 16:9

```
[STYLE] [PRODUCT]
Three identical bodysuits laid flat side by side on the plaster backdrop,
seen from directly above, evenly spaced, perfectly aligned: Nude on the left,
warm Marron in the centre, Noir on the right. No body, no mannequin.
Landscape 16:9 crop.
```

---

## 4. Le prompt négatif

À passer dans le champ prévu, ou à la fin du prompt selon le modèle.

```
NEGATIVE: airbrushed plastic skin, liquified waist, exaggerated hourglass,
slimming distortion, warped background lines, extra limbs, extra fingers,
lace, underwire, visible seams, visible hems, elastic bands, logos, text,
watermarks, hard studio shadows, harsh flash, colour gradient background,
teal and orange grade, glossy fabric, sequins, jewellery, high heels.
```

Les cinq premières entrées ne sont pas cosmétiques : une taille liquéfiée ou
une silhouette déformée transforme une photo produit en allégation
d'amincissement, ce que le site s'interdit partout ailleurs.

---

## 5. Méthode — obtenir une série qui se tient

1. **Générez d'abord le plan 3.1** et itérez jusqu'à ce qu'il soit juste.
   C'est lui qui fixe le modèle, la peau, la lumière et le coloris.
2. **Passez-le en image de référence** pour les huit autres, plutôt que de
   repartir du texte seul. C'est ce qui garantit la même personne et le même
   vêtement d'une image à l'autre — un prompt texte, même identique, ne le
   garantit jamais.
3. **Gardez la même graine (seed)** entre les variantes d'un même plan.
4. Générez les coloris Marron et Noir **par édition** du plan 3.1, pas par un
   nouveau prompt : « change the bodysuit colour to warm brown, keep
   everything else identical ».
5. Format : **1:1 pour la galerie** (la fiche est réglée en carré), **16:9
   pour les bandeaux pleine largeur**.

---

## 6. Deux réserves, à connaître avant de publier

**Le vêtement généré doit ressembler au vêtement livré.** C'est la raison
d'être du bloc PRODUCT ci-dessus. Si l'image montre une bretelle large alors
que la vôtre est fine, ou une dentelle qui n'existe pas, c'est une publicité
trompeuse — indépendamment du fait que l'image soit générée ou photographiée.

**Aucune retouche amincissante.** Le site ne promet nulle part un effet
durable sur le corps ; les images ne doivent pas le promettre non plus. D'où
la mention `unretouched skin texture` dans les plans portés et les entrées
correspondantes du prompt négatif.
