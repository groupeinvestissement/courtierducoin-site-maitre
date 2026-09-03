# G8 — Préparation locale au déploiement

Date : 2026-09-02  
Verdict : **PASS LOCAL — AUCUN DÉPLOIEMENT AUTORISÉ**

## Paquet

- Branche locale dédiée : `codex/multi-sector-heroes-v1`.
- Base connue saine : `b3e4643146af928a37194259e08181196c8de2e7`.
- Instructions de livraison : `DEPLOYMENT_PACKAGE.md`.
- Procédure de retour arrière : `ROLLBACK.md`.
- Inventaires détaillés : `deployment-files.json` et `deployment-files.txt`.

## Contrôles réalisés

- verdict indépendant G7 : PASS;
- inventaire final avec état, taille et SHA-256 de chaque fichier du paquet : PASS;
- plus gros fichier média : 7 308 461 octets, sous la limite GitHub de 100 Mio;
- commit local atomique sur la branche dédiée : PASS;
- test de réversion sans commit dans un worktree temporaire détaché : PASS;
- index et arborescence après réversion identiques au parent connu sain : PASS;
- absence de fichier non suivi après réversion : PASS;
- nouvelle exécution des validateurs statiques sur le paquet final : PASS.

## Retour arrière testé

Le worktree de recette a été créé depuis le commit local complet. La commande de réversion a été appliquée avec `--no-commit`, puis l'index et l'arborescence ont été comparés au parent du commit d'intégration. Les deux comparaisons étaient sans différence. Le composant, la table et la release ajoutés étaient absents après réversion, tandis que les pages historiques correspondaient à la base. Le worktree temporaire a ensuite été retiré après validation de son chemin absolu.

La production est explicitement hors périmètre de ce créneau.
