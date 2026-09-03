# G0 — Audit du projet Web

Date : 2026-09-02  
Branche : `codex/multi-sector-heroes-v1`  
Base : `b3e4643146af928a37194259e08181196c8de2e7`

## Verdict

**PASS.** Le dépôt maître est un site multipage statique (HTML, CSS et JavaScript natif) publié directement depuis la racine Git sur Apache/Hostinger. Aucun framework, gestionnaire de paquets, build applicatif, CI ou fichier `.openai/hosting.json` n'est présent.

Le travail est isolé dans le worktree propre `C:\Users\Samsung\Documents\Website\release-multi-sector-heroes-v1`. Les checkouts sales du dépôt maître, du dépôt Rosemont historique et de l'audit sectoriel ne seront ni modifiés ni fusionnés dans cette livraison.

## Matrice réelle

- 19 secteurs canoniques attendus : présents.
- 6 profils par secteur (`main`, `o1a11`, `02a22`, `03i33`, `04m44`, `05c55`) : présents.
- 114/114 fichiers HTML : présents.
- 114/114 routes canoniques : exactes.
- 114/114 pages : exactement un H1.

Les six groupes historiques suivants existent aussi dans le dépôt, mais ne figurent pas dans la release et ne recevront aucun média :

- `centre-outremont-westmount-vmr`
- `centre-ville-de-laval`
- `ile-des-soeurs`
- `ouest-de-lile-nord`
- `ouest-de-lile-sud`
- `verdun`

Statut : `NEW_SECTOR_REQUIRED` si ces groupes doivent un jour devenir des secteurs autonomes plutôt que des alias historiques.

## Héros actuels

- 102 pages utilisent un hero `.rm-hero` avec portrait ou image statique.
- 6 pages Vaudreuil utilisent une image WebP locale.
- 6 pages Rosemont utilisent déjà une vidéo responsive.
- Familles de pages : 96 `sector-master`, 6 Laval, 6 Vaudreuil, 6 Rosemont.
- Les six scripts vidéo Rosemont devront cesser de s'exécuter sur les pages migrées afin de garantir une seule source MP4.
- Les blocs explicatifs « vidéo en préparation » présents plus bas dans plusieurs pages ne sont pas le hero décoratif et restent hors de cette migration.

## Hébergement et contraintes

- Racine publique cible : `/assets/video/heroes/heroes-2026-08-31-v01/`.
- `.htaccess` connaît déjà `video/mp4`, `image/jpeg` et `text/vtt`, ainsi que le cache versionné immuable.
- Les requêtes `Range` doivent être confirmées après publication sur Hostinger.
- Le serveur de développement historique n'est pas une preuve serveur suffisante tant qu'il ne gère pas correctement MIME et `206 Partial Content`.

## Génération et protection contre l'écrasement

Plusieurs générateurs historiques peuvent réécrire des pages complètes. L'intégration sera donc reproductible au moyen d'un adaptateur dédié, piloté par les 19 `web-manifest.json`, et son exécution devra être idempotente. La documentation du dépôt exigera de relancer cet adaptateur et son validateur après tout générateur de pages.

## Pages échantillons retenues par le correcteur indépendant

1. `/secteurs/villeray-saint-michel-parc-extension/` — page principale et H1 long.
2. `/rosemont-la-petite-patrie/o1a11/` — page sensible avec ancien hero vidéo.
3. `/vaudreuil-soulanges/04m44/` — page propriété sur la pile Vaudreuil.
4. Contrôle complémentaire : `/secteurs/laval/`.

