# G7 — Revue indépendante finale

Date : 2026-09-02  
Correcteur : agent indépendant, lecture seule  
Verdict : **PASS**  
Autorisation : **passage à G8 uniquement — aucune publication ni mise en production**

## Contrôles confirmés

- 114/114 routes et 19 manifestes conformes;
- contenu, H1, CTA, formulaires, SEO, JSON-LD, coordonnées et analytics préservés;
- 482/482 fichiers de release copiés à l'identique et 480/480 charges utiles conformes par SHA-256;
- 228 MP4 H.264 silencieux de 18 secondes et 228 affiches conformes;
- mouvement réduit sans MP4, source figée et replis fonctionnels;
- absence d'ancien chargeur Rosemont, de `VideoObject`, de mention HeyGen et de chemin local sur les 114 pages;
- 699 cibles locales valides;
- crédits complets : 19 secteurs, 190 médias, 380 liens source/licence et 380 empreintes;
- 38 pages sensibles sans adresse ni association à un dossier réel;
- MIME, cache immutable, plages d'octets et réponse 206 conformes;
- captures sans anomalie bloquante.

## Blocker levé

Le premier passage final avait refusé G7 faute de preuve avec réseau mobile simulé. Le complément a été exécuté sur les quatre architectures à cache froid, en 390 × 844, avec 150 ms de latence par réponse et 1,6 Mbit/s par flux : LCP `IMG` de 864 à 1 576 ms, CLS 0 dans 4/4 cas, exactement un MP4 mobile et aucun MP4 bureau. Le rapport G6 a aussi été corrigé pour refléter exactement les LCP locaux et l'accessibilité des cibles tactiles.

## Réserves non bloquantes

- En 390 × 844, la barre fixe masque initialement une partie des CTA Villeray et Laval; ils redeviennent entièrement accessibles après environ 107 px et 31 px de défilement et une action équivalente reste disponible dans la barre.
- L'émulation réseau est locale et par flux; G9 devra répéter les mesures sur l'hébergement réel.
- Quatre captures PNG sont conservées, tandis que la couverture complète des 252 contrôles page/viewport est documentée par le rapport automatisé.
- Le hero décoratif de 18 secondes n'offre pas de commande pause visible. Le Working Book impose toutefois la boucle automatique et le repli `prefers-reduced-motion`; cette réserve de durcissement ne bloque pas le contrat actuel, mais devra être réévaluée avant toute revendication formelle WCAG 2.2 AA.

Aucun défaut bloquant ne reste ouvert. Le correcteur autorise explicitement G8 et exclut tout déploiement de cette autorisation.
