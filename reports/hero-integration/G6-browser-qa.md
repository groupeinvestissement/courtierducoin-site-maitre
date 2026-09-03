# G6 — Contrôle navigateur

Date : 2026-09-02  
Adresse locale : `http://127.0.0.1:4173/`  
Verdict : **PASS**

La recette a été exécutée dans le navigateur intégré, à travers `qa/serve-sector-hero-preview.mjs`, qui reproduit les types MIME, le cache immutable et les plages d'octets nécessaires aux MP4.

## Couverture

- 114/114 routes en 1280 × 800 : PASS.
- 114/114 routes en 390 × 844 : PASS.
- Les quatre architectures témoins ont aussi été testées en 360 × 800, 430 × 932, 768 × 1024, 900 × 900, 1024 × 768 et 1920 × 1080 : 24/24 PASS.
- Total des contrôles page/viewport automatisés : 252, tous PASS.

À chaque passage ont été contrôlés : hero unique, H1 unique, contenu entièrement contenu, affiche et voile pleine surface, absence de débordement horizontal, dimensions tactiles d'au moins 44 px et accessibilité par défilement, lien de crédits, source attendue, dimensions vidéo, lecture, boucle, son coupé et absence de contrôles.

## Médias et replis

- Bureau : vidéo 1920 × 1080 et affiche bureau sélectionnées.
- Mobile/portrait : vidéo 810 × 1440 et affiche mobile sélectionnées.
- Mouvement normal : lecture réelle confirmée par progression de `currentTime`, `paused=false`, `muted=true`.
- Rotation après chargement : la source MP4 reste inchangée et une seule vidéo de release demeure observée.
- Mouvement réduit réel : `currentSrc=""`, aucun attribut `src`, `readyState=0`, vidéo masquée et aucune ressource MP4 de release observée.
- JavaScript hero absent : affiche visible, aucun MP4.
- Données vidéo absentes : classe de repli, affiche visible, aucun MP4.
- URL MP4 invalide : erreur absorbée, vidéo non révélée et affiche visible.
- Console : aucune erreur ni alerte sur la recette finale.

Le mode « mouvement normal » est injecté uniquement par le serveur de test, car la machine de recette demande réellement la réduction du mouvement. Aucun crochet de test n'est présent dans les fichiers de production.

## Performance locale

Sur les quatre architectures, en 1280 × 800 et 390 × 844 :

- CLS du hero : `0` dans les 8 cas;
- LCP final : affiche du hero dans 5 cas sur 8 et vidéo dans 3 cas sur 8 (Vaudreuil mobile, Laval bureau et mobile); l'affiche reste prioritaire dans le HTML et assure le premier rendu;
- LCP local observé : 136 à 236 ms;
- chargement de page local observé : 140 à 292 ms environ;
- une seule ressource MP4 de release par visite.

Le simulateur de viewport du navigateur peut enregistrer les deux URL d'affiche lors d'un changement artificiel de taille; l'affiche LCP et `currentSrc` correspondent néanmoins toujours au format actif. Ce comportement d'émulation ne touche pas la règle absolue d'une seule source MP4.

## Performance avec réseau mobile simulé

Le complément demandé par le contrôle indépendant a été exécuté à cache froid sur les quatre architectures témoins, avec un viewport navigateur de 390 × 844. Le serveur de recette a appliqué 150 ms de latence à chaque réponse et plafonné chaque flux descendant à 1,6 Mbit/s. Un jeton de cache unique a été appliqué au composant partagé et aux médias du hero à chaque navigation. Le mouvement normal a été simulé uniquement par le harnais de recette, puisque la machine demande réellement la réduction du mouvement.

| Architecture | LCP | Élément LCP | CLS | MP4 observé |
| --- | ---: | --- | ---: | --- |
| Villeray | 864 ms | affiche mobile `IMG` | 0 | 1 mobile, 0 bureau |
| Rosemont | 1 000 ms | affiche mobile `IMG` | 0 | 1 mobile, 0 bureau |
| Vaudreuil | 1 576 ms | affiche mobile `IMG` | 0 | 1 mobile, 0 bureau |
| Laval | 1 576 ms | affiche mobile `IMG` | 0 | 1 mobile, 0 bureau |

Les quatre vidéos étaient en lecture, muettes et en état prêt; aucun débordement horizontal n'a été observé. La preuve structurée est conservée dans `mobile-network-proof.json`. Verdict du complément réseau mobile : **PASS**.

Réserve UX non bloquante constatée en 390 × 844 : la barre d'action fixe recouvre au premier écran une partie des CTA de contenu sur Villeray et Laval. Ceux-ci redeviennent entièrement accessibles par défilement et la barre fixe fournit une action équivalente.

## HTTP local

- page HTML : `200`, `text/html; charset=utf-8`;
- MP4 : `video/mp4`, `Accept-Ranges: bytes`;
- demande `Range: bytes=0-1023` : `206 Partial Content`, `Content-Range` correct;
- MP4/JPEG : `Cache-Control: public, max-age=31536000, immutable`.

## Captures

- `captures/villeray-main-1920x1080.png`
- `captures/villeray-main-390x844.png`
- `captures/rosemont-o1a11-1280x800.png`
- `captures/vaudreuil-04m44-390x844.png`

La vidéo de présentation distincte « Rencontrez Pierre » à Rosemont a aussi été contrôlée : affiche V3, MP4 1280 × 720, VTT, `preload="metadata"`, contrôles natifs, absence d'autoplay, son non coupé et lecture effective. Elle n'est pas le hero décoratif.
