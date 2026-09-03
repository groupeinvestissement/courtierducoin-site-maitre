# G5 — Contrôles statiques

Date : 2026-09-02  
Verdict : **PASS**

Le dépôt est un site statique sans `package.json`, compilateur, typecheck ou pipeline de build. Les contrôles applicables ont été exécutés directement.

## Résultats

- Syntaxe Node/JavaScript : PASS pour tous les fichiers ajoutés ou modifiés.
- `git diff --check` : PASS; aucune erreur d'espace ou de conflit.
- Validateur complet `qa/validate-multi-sector-hero-integration.mjs --all` : PASS.
- Test runtime `qa/test-sector-hero-runtime.mjs` : PASS pour bureau, mobile/portrait, mouvement réduit, données absentes et erreur vidéo.
- Vérificateur `qa/check-sector-page-links.mjs` : PASS sur 114 pages et 699 cibles locales uniques; 0 fichier, route ou fragment absent.
- Table recalculée depuis les 19 manifestes : 114/114 entrées exactes et uniques.
- Pages intégrées détectées : 114/114.
- H1 : exactement 1 par page.
- Copie publique : 480/480 charges utiles conformes en taille et SHA-256.
- Inventaire physique : 482 fichiers, 544 696 118 octets.
- Empreinte `MANIFEST.json` : `130525f7da1278e8bdd54037e98e63e1118bb9d97341e07f6cea57573e0b2df9`.
- Page de crédits : 19 secteurs, 190 médias, 190 liens source et 190 licences documentées.
- Valeurs temporaires propres à l'intégration, dépendances HeyGen et chemins locaux dans les pages livrées : aucun.

Les blocs éditoriaux préexistants annonçant une future capsule sous le hero ne sont pas le composant hero décoratif et n'ont pas été modifiés.
