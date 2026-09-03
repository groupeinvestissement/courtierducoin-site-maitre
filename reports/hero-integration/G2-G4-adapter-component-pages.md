# G2 à G4 — Adaptateur, composant commun et connexion des pages

Date : 2026-09-02  
Release : `heroes-2026-08-31-v01`  
Verdict : **PASS**

## G2 — Adaptateur de manifestes

- `tools/integrate-multi-sector-heroes.mjs` charge les 19 `web-manifest.json` depuis la copie publique versionnée.
- Le script refuse un statut autre que `READY_FOR_SITE_INTEGRATION / NOT_DEPLOYED`, une clé absente, une route ambiguë, une route inattendue ou un actif absent/vide.
- La table stable `data/sector-hero-map.json` est reconstruite depuis les manifestes : 19 secteurs, 6 clés chacun, 114 routes uniques et 4 actifs par route.
- Aucun nom de fichier média n'est reconstruit : les quatre chemins proviennent directement du manifeste de chaque secteur.
- Aucun manifeste n'est demandé par le navigateur à l'exécution.

## G3 — Composant commun

- `sector-hero.css` et `sector-hero.js` servent les 114 pages.
- Le HTML initial contient un `<picture>` responsive avec affiche mobile et affiche bureau prioritaire.
- Le `<video>` initial ne contient ni `src`, ni `<source>`, ni `poster`, ni contrôles.
- Une seule source MP4 est choisie au premier chargement : mobile à 900 px ou moins, ou en portrait; bureau sinon.
- La source reste figée après rotation/redimensionnement afin de ne jamais charger la seconde variante pendant la même visite.
- `prefers-reduced-motion: reduce` ne déclenche aucun MP4.
- JavaScript absent, données absentes et erreur vidéo conservent tous l'affiche.
- La vidéo est décorative : `muted`, `loop`, `autoplay`, `playsinline`, `tabindex="-1"`, `aria-hidden="true"`, sans contrôles.
- Les styles communs neutralisent les collisions des quatre architectures, notamment les hauteurs et `max-width` historiques de Vaudreuil/Laval.

## G4 — Connexion des pages

Échantillon examiné avant généralisation :

1. `/secteurs/villeray-saint-michel-parc-extension/`
2. `/rosemont-la-petite-patrie/o1a11/`
3. `/vaudreuil-soulanges/04m44/`
4. `/secteurs/laval/` (architecture supplémentaire)

Le premier verdict indépendant a été **FAIL**. Les défauts trouvés ont été corrigés avant la généralisation :

- source MP4 susceptible de changer après rotation;
- collisions de spécificité CSS et voile Vaudreuil plafonné;
- hauteur fixe rognant du contenu;
- perte du libellé textuel auparavant associé au portrait;
- cibles tactiles trop petites;
- lien de retour erroné sur la page de crédits;
- contrôles automatisés incomplets.

Après corrections et nouvelles mesures, le correcteur a donné **PASS** et a autorisé explicitement la généralisation.

Résultat final :

- 114/114 routes intégrées;
- 0 route hors catalogue modifiée;
- 1 composant partagé;
- 2e exécution complète : `changedPages: 0`;
- H1, texte visible, CTA, téléphone, courriel, formulaires, SEO et attributs analytics/CRM comparés au commit de base et conservés;
- anciens chargeurs hero Rosemont retirés des six pages migrées, mais anciens fichiers conservés dans Git pour le retour arrière;
- aucun `VideoObject` décoratif sur les 114 pages.
