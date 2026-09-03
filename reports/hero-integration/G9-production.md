# G9 — Production

Date : 2026-09-03
Statut : **PASS — LIVE**

## Publication

- URL principale testée : `https://www.courtierducoin.ca/secteurs/rosemont-la-petite-patrie/`.
- Branche : `main`.
- Commit fonctionnel : `4000570fcd259cd22ec536aabc45c70d7329e2e4`.
- Arbre : `3af83c4079d08f7b0766f2cf9c07331b1287aa22`.
- L'arbre est identique à celui du livrable validé `7dc602fa365ab3870179ab3668a6a5cfd6adcc2c`.

## Audit public complet

- 114/114 pages : HTTP 200, secteur, clé de page, composant et quatre chemins média exacts.
- 456/456 médias déclarés : HTTP 200, MIME correct, taille non nulle et cache `public, max-age=31536000, immutable`.
- 19 héros principaux et la vidéo avatar Rosemont : requête `Range: bytes=0-1023`, réponse 206, `Content-Range` exact et MIME `video/mp4`.
- Composant CSS/JS, crédits, affiche avatar et VTT : accessibles.
- Page de crédits : HTTP 200, 19 sections.

## Recette navigateur

Rosemont principal a été contrôlé sur ordinateur et mobile. Villeray principal, Vaudreuil `04m44`, Laval principal et Rosemont `o1a11` ont été contrôlés à 1440 × 900 et 390 × 844 :

- bon poster desktop/mobile;
- H1, CTA, formulaires et lien de crédits présents;
- aucun débordement horizontal;
- aucune erreur ni alerte console;
- préférence reduced-motion réelle respectée : aucune source MP4 chargée.

La vidéo distincte « Rencontrez Pierre » a son affiche V3 bouche fermée, ses contrôles, `playsinline`, `preload="metadata"`, aucun autoplay ni mute et une piste VTT sans `default`. Sa lecture publique a été déclenchée : temps de lecture en progression, son non muet, volume 1 et aucune erreur média. La transcription visible correspond à la V3.

## Contre-vérification indépendante

Verdict : **PASS — aucun défaut produit détecté**.

Le correcteur a confirmé indépendamment 114/114 HTML publics, 456/456 médias, les réponses Range/cache, dix MP4 d'échantillon identiques bit à bit à la release, le composant public exact et tous les attributs/transcriptions de la vidéo de Pierre. L'affiche servie par le CDN est une recompression 1600 × 900 visuellement équivalente de la bonne image bouche fermée.

## Limites de preuve

Le navigateur disponible impose `prefers-reduced-motion: reduce` et n'expose pas l'API plein écran. Le mouvement normal a donc été validé par le test runtime local sur l'arbre public exact, et la jouabilité des MP4 publics par les contrôles HTTP/Range et la lecture effective de l'avatar. Cette limite de l'environnement de recette n'est pas un défaut produit constaté.

La procédure de retour arrière a été ajustée à la topologie fractionnée réellement publiée; voir `ROLLBACK.md`.
