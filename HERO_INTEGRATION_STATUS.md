# Statut d'intégration — héros vidéo multi-secteurs

Release : `heroes-2026-08-31-v01`
Branche : `main`
Déploiement : **LIVE — G9 PASS — 2026-09-03**
Commit fonctionnel : `4000570fcd259cd22ec536aabc45c70d7329e2e4`

| Gate | Statut | Preuve | Fichiers modifiés | Défaut / correction | Prochaine action |
|---|---|---|---|---|---|
| G0 — Audit du site | PASS | `reports/hero-integration/G0-site-audit.md` | Rapport et registre seulement | 6 groupes historiques hors catalogue identifiés; aucun média ne leur sera attribué | Vérifier la release source puis sa copie publique |
| G1 — Release immuable | PASS | `reports/hero-integration/G1-release-verification.md` | Copie immuable sous `assets/video/heroes/heroes-2026-08-31-v01/` | 482/482 fichiers identiques; 0 défaut | Construire l'adaptateur de manifestes |
| G2 — Adaptateur | PASS | `data/sector-hero-map.json`, test 114/114 | Adaptateur et table stable | Aucun écart | Maintenir la génération depuis les 19 manifestes |
| G3 — Composant commun | PASS | Tests runtime et replis | `sector-hero.css`, `sector-hero.js` | Collisions CSS et changement de source corrigés | Revue finale indépendante |
| G4 — Connexion des pages | PASS | `reports/hero-integration/G2-G4-adapter-component-pages.md` | 114 pages + crédits | Premier FAIL correcteur entièrement corrigé; idempotence 0 changement | Revue finale indépendante |
| G5 — QA statique | PASS | `reports/hero-integration/G5-static-qa.md` | Scripts QA | 699 cibles locales vérifiées, 0 défaut | Revue finale indépendante |
| G6 — QA navigateur | PASS | `reports/hero-integration/G6-browser-qa.md`, captures | Serveur QA seulement | 252 contrôles page/viewport PASS; quatre replis PASS | Revue finale indépendante |
| G7 — Revue indépendante | PASS | `reports/hero-integration/G7-independent-review.md` | Rapport indépendant | Blocker réseau mobile levé; aucun défaut bloquant restant | Préparer et tester G8 |
| G8 — Prêt au déploiement | PASS | `reports/hero-integration/G8-deployment-readiness.md` | Paquet, inventaires et retour arrière | Commit local et réversion exacte testés; aucun défaut ouvert | Terminé |
| G9 — Production | PASS | `reports/hero-integration/G9-production.md`, `reports/hero-integration/g9-production-proof.json` | Journal de production et procédure de retour arrière mise à jour | 114/114 pages et 456/456 médias publics conformes; contre-vérification indépendante PASS | Conserver les anciens médias pendant la période d'acceptation |
