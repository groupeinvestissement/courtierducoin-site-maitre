# Retour arrière — héros vidéo multi-secteurs

Date : 2026-09-02  
Base connue saine : `b3e4643146af928a37194259e08181196c8de2e7`  
État : **PRÉPARÉ LOCALEMENT — AUCUNE PRODUCTION MODIFIÉE**

## Méthode recommandée

Après un déploiement Git autorisé, revenir en arrière avec un nouveau commit de réversion. Ne pas réinitialiser brutalement la branche et ne pas supprimer les médias à la main.

```text
git revert --no-edit <SHA_DU_COMMIT_INTEGRATION>
```

Le SHA doit provenir du journal du déploiement, et son parent doit être la base connue saine indiquée ci-dessus. Faire ensuite valider et déployer le commit de réversion selon le processus normal et avec l'autorisation requise.

Cette réversion restaure les 114 fichiers HTML antérieurs et retire le composant, la table, les crédits, les médias et les outils ajoutés par le paquet. Les anciens scripts et médias Rosemont n'ont pas été supprimés par l'intégration; ils redeviennent donc disponibles immédiatement après la réversion.

## Vérification après réversion

1. Confirmer que l'arborescence correspond au parent du commit d'intégration.
2. Vérifier les quatre architectures témoins :
   - `/secteurs/villeray-saint-michel-parc-extension/`;
   - `/rosemont-la-petite-patrie/o1a11/`;
   - `/vaudreuil-soulanges/04m44/`;
   - `/secteurs/laval/`.
3. Confirmer le fonctionnement des CTA, formulaires, liens, téléphone, courriel et suivi analytique.
4. Confirmer que les anciennes sources hero sont restaurées et qu'aucune référence vers `sector-hero.js`, `sector-hero.css` ou `assets/video/heroes/heroes-2026-08-31-v01/` ne subsiste dans les 114 pages.
5. Conserver le commit d'intégration et les inventaires jusqu'à l'acceptation humaine du retour arrière.

## Test local du mécanisme

Le paquet final doit être testé dans un worktree temporaire détaché : appliquer la réversion sans commit, comparer le résultat au parent du commit d'intégration, puis retirer uniquement ce worktree temporaire après validation de son chemin absolu. Le résultat de ce test est consigné dans `reports/hero-integration/G8-deployment-readiness.md`.
