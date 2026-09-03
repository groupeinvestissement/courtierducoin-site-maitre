# Retour arrière — héros vidéo multi-secteurs

Date : 2026-09-03
Base fonctionnelle connue saine : `b3e4643146af928a37194259e08181196c8de2e7`
Commit d'intégration public : `4000570fcd259cd22ec536aabc45c70d7329e2e4`
Parent réel du commit d'intégration : `a7531d56e0d0efea65e079de6f9a878edce91994`
État : **PRODUCTION ACTIVE — RETOUR ARRIÈRE FONCTIONNEL PRÉPARÉ**

## Topologie du déploiement

Les 482 fichiers de release ont été envoyés en cinq commits de transit avant le commit d'intégration. Le parent `a7531d5` contient donc déjà ces médias, mais conserve les anciennes pages. Le commit `4000570` branche les 114 pages sur la release et ajoute le composant, la table de routage, les crédits et les outils.

Cette topologie rend les médias inertes sans les supprimer lorsqu'on restaure les pages antérieures. C'est le retour arrière d'urgence recommandé : il est petit, réversible et ne nécessite aucun transfert massif.

## Méthode recommandée

Créer une branche depuis le `main` courant. Restaurer depuis la base saine uniquement les 114 fichiers HTML qui avaient été modifiés par le commit d'intégration, puis créer un nouveau commit. Ne pas réinitialiser brutalement la branche et ne pas supprimer les médias à la main.

```powershell
$base = 'b3e4643146af928a37194259e08181196c8de2e7'
$integration = '4000570fcd259cd22ec536aabc45c70d7329e2e4'
$pages = git diff --diff-filter=M --name-only $base $integration -- '*.html'
if ($pages.Count -ne 114) { throw "Inventaire de rollback inattendu : $($pages.Count) pages" }
git restore --source=$base --staged --worktree -- $pages
git commit -m 'revert: restore pre-hero sector pages'
```

Faire valider ce commit avant de le pousser sur `main`. Le composant, les manifestes, les crédits et les médias ajoutés restent alors présents mais ne sont plus référencés par les pages publiques. Leur nettoyage éventuel doit faire l'objet d'un second changement distinct, après stabilisation.

Un `git revert 4000570` direct n'est plus la méthode recommandée après les commits documentaires G9 : il tenterait aussi de retirer des rapports maintenant mis à jour et pourrait demander une résolution manuelle, sans avantage fonctionnel.

## Vérification après réversion

1. Confirmer que les 114 pages restaurées sont identiques à la base saine.
2. Vérifier les quatre architectures témoins :
   - `/secteurs/villeray-saint-michel-parc-extension/`;
   - `/rosemont-la-petite-patrie/o1a11/`;
   - `/vaudreuil-soulanges/04m44/`;
   - `/secteurs/laval/`.
3. Confirmer le fonctionnement des CTA, formulaires, liens, téléphone, courriel et suivi analytique.
4. Confirmer qu'aucune référence vers `sector-hero.js`, `sector-hero.css` ou `assets/video/heroes/heroes-2026-08-31-v01/` ne subsiste dans ces 114 pages.
5. Conserver les commits, les médias et les inventaires jusqu'à l'acceptation humaine du retour arrière.

Le test de réversion exacte du paquet monolithique d'origine reste consigné dans `reports/hero-integration/G8-deployment-readiness.md`. La procédure ci-dessus tient compte de la topologie fractionnée réellement publiée.
