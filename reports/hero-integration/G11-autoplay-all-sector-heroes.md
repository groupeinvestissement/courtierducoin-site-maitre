# G11 — Lecture automatique de tous les héros de secteurs

Date : 2026-09-05

Statut : **PASS — PRODUCTION**

Commit fonctionnel publié : `6529f53bb499b103a93d40b6f7bf14837641bcac`

## Portée

- 19 secteurs.
- 6 routes par secteur : la page principale et les 5 pages spécialisées.
- Total : 114 vidéos d’en-tête.
- Les vidéos secondaires situées plus bas dans les pages restent des lecteurs manuels.

## Correction

- L’en-tête démarre automatiquement et silencieusement, y compris lorsque Chrome reçoit `prefers-reduced-motion: reduce` de Windows.
- Les attributs `autoplay`, `muted`, `loop` et `playsinline` sont conservés sur chaque vidéo d’en-tête.
- Une commande de pause/reprise reste disponible pour les personnes ayant demandé la réduction des animations.
- Une pause volontaire est mémorisée pour la session de l’onglet.
- Le script commun cible exclusivement `[data-sector-hero-video]`.
- Une règle de validation interdit `autoplay` sur toute vidéo secondaire.
- Les cinq lecteurs secondaires Rosemont, leurs sources, affiches, scripts et données structurées légitimes sont préservés.
- Le cache-busting commun passe à `20260905-v3` sur les 114 pages.

## Vérifications

- Validation statique locale : 114/114 pages, 480/480 charges utiles et 482/482 fichiers physiques — PASS.
- Liens internes : 114 pages et 709 cibles locales, aucun défaut — PASS.
- Chrome local : 114 routes en mode ordinateur avec mouvement réduit et 114 routes en mode mobile, soit 228 lectures réelles — PASS.
- Audit public : 114/114 pages servent le composant `20260905-v3`, avec un seul hero automatique et aucune vidéo secondaire automatique — PASS.
- Chrome public : les 6 routes Rosemont contrôlées sur ordinateur et mobile, soit 12 lectures réelles; les 5 lecteurs secondaires contrôlés dans les deux modes — PASS.
- Revue indépendante : PASS, aucun défaut concret ni régression détectés.

## Fichiers

- `sector-hero.js`.
- Outil d’intégration et trois scripts QA.
- 114 fichiers HTML : uniquement la version de cache CSS/JS `v2` vers `v3`.
- Aucun fichier média modifié.

## Retour arrière

Le point de production antérieur au correctif est `4448546d392e53ec6b2d8d52436a4407371c0cb6`. Le retour arrière doit être effectué par un commit de réversion du correctif fonctionnel; les médias et les nouvelles vidéos secondaires Rosemont ne doivent pas être retirés.
