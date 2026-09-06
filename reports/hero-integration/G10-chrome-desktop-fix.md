# G10 — Correctif vidéo Chrome sur ordinateur

Date : 2026-09-05

Statut : **PASS — PRODUCTION**

Commit publié : `236d30baefed4da1035fbf562f7a6a2fd87f4b67`

## Cause confirmée

Sur l’ordinateur concerné, Chrome annonçait `prefers-reduced-motion: reduce`, conformément au réglage d’animation de Windows. Le composant précédent respectait cette préférence en retirant entièrement la source MP4. Le poster restait donc visible, sans commande permettant à la personne de lancer volontairement la vidéo.

## Correction

- Le repli sans mouvement reste actif par défaut lorsque la préférence système le demande.
- Un bouton natif **Lire la vidéo** est visible dès l’ouverture du hero.
- Un clic charge la bonne variante MP4, lance la lecture et transforme la commande en **Mettre la vidéo en pause**.
- Le choix est conservé dans la session de l’onglet afin que les autres pages de secteurs démarrent aussi leur vidéo.
- Un échec de lecture restaure le poster et retire la source.
- Les utilisateurs sans préférence de mouvement réduit conservent l’autoplay silencieux existant.
- Le cache-busting commun passe à `20260905-v2` sur les 114 pages.

## Vérifications

- Validation statique : 114/114 pages, 480/480 charges utiles, 482/482 fichiers physiques.
- Liens internes : 699 cibles vérifiées, aucun défaut.
- Test runtime : desktop, mobile, mouvement réduit, opt-in, persistance de session, données absentes et erreur vidéo — PASS.
- Chrome installé sur Windows, en mouvement réduit : poster initial, bouton visible, lecture effective, `readyState=4`, temps de lecture supérieur à 2 s — PASS.
- Navigation Lachine / LaSalle vers Verdun / L’Île-des-Sœurs dans la même session : seconde vidéo chargée et en lecture — PASS.
- Production : 114/114 pages servent `sector-hero.js` et `sector-hero.css` en version `20260905-v2`; les deux fichiers publics contiennent le correctif — PASS.
- Console Chrome : aucune erreur pendant la recette automatisée de production.
- Revue indépendante : PASS, aucun défaut bloquant ni régression concrète.

## Retour arrière

Le commit précédent de production est `3442fae0ddc6cd5bc6b0a7cb08792aaa2daa2c24`. Les médias n’ont pas été modifiés par ce correctif.
