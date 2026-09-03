# Paquet local de déploiement — héros vidéo multi-secteurs

Date : 2026-09-02  
Branche : `codex/multi-sector-heroes-v1`  
Base : `b3e4643146af928a37194259e08181196c8de2e7`  
Release : `heroes-2026-08-31-v01`  
État : **PRÊT LOCALEMENT — NON PUBLIÉ — NON DÉPLOYÉ**

## Contenu

- 19 secteurs et 114 routes françaises;
- 228 MP4 silencieux et 228 affiches, plus les manifestes, licences et documents de release;
- un composant hero partagé : `sector-hero.css` et `sector-hero.js`;
- une table stable de 114 routes : `data/sector-hero-map.json`;
- une page de crédits couvrant 19 secteurs et 190 médias;
- scripts de validation, rapports, captures et preuve réseau mobile;
- ancienne implantation et anciens médias Rosemont conservés pour le retour arrière.

L'inventaire exact, les tailles et SHA-256 se trouvent dans :

- `reports/hero-integration/deployment-files.json`;
- `reports/hero-integration/deployment-files.txt`.

Ces deux fichiers d'inventaire s'excluent eux-mêmes pour éviter des empreintes circulaires.

## Barrières avant production

1. Les gates G0 à G8 doivent rester à PASS.
2. Le commit local livré doit être identifié et son inventaire conservé avec le journal de déploiement.
3. Une autorisation humaine explicite distincte est obligatoire. Le superviseur interdit tout déploiement dans le présent créneau.
4. Aucun fichier ne doit être renommé, recompressé ou modifié pendant le transfert.
5. Le déploiement doit reprendre l'arborescence à la racine publique telle quelle.

## Validation avant déploiement

Depuis la racine du dépôt, exécuter :

```text
node qa/validate-multi-sector-hero-integration.mjs --all
node qa/test-sector-hero-runtime.mjs
node qa/check-sector-page-links.mjs
```

Les trois contrôles doivent terminer sans erreur. Vérifier ensuite les empreintes du paquet avec l'inventaire JSON.

## Recette après déploiement autorisé

Contrôler au minimum la page principale et une page de propriété de Rosemont, Villeray, Vaudreuil et Laval, sur ordinateur et mobile :

- affiche immédiate puis vidéo silencieuse en boucle;
- une seule variante MP4 chargée;
- aucune vidéo avec mouvement réduit;
- H1, CTA, formulaires, téléphone, courriel et attributs de suivi préservés;
- lien de crédits valide;
- aucun débordement horizontal;
- réponses MP4 avec type `video/mp4`, plages d'octets et cache long;
- absence d'erreur console;
- vidéo distincte « Rencontrez Pierre » Rosemont toujours fonctionnelle, avec contrôles et son.

Ne supprimer les anciens médias qu'après acceptation humaine de cette recette. La procédure de retour arrière est définie dans `ROLLBACK.md`.
