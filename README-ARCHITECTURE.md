# Architecture des campagnes locales

Les pages locales sont produites par `generate-campaign-pages.mjs`. Les données des 17 secteurs et des 5 campagnes sont centralisées au début du fichier. Il ne faut pas modifier les 102 pages générées à la main.

## Production

1. Modifier les configurations de secteur ou de campagne.
2. Exécuter `node generate-campaign-pages.mjs`.
3. Exécuter `node validate-campaign-pages.mjs`.

Le générateur produit 17 pages universelles sous `/secteurs/`, 85 pages spécialisées, le sitemap central et `redirect-map.json` pour configurer les 102 redirections 301 au niveau DNS/hébergement.

Toutes les nouvelles pages restent volontairement en `noindex,follow` jusqu’à l’ajout d’un contenu local substantiel, de médias réels et de preuves locales. Le canonical pointe toujours vers `www.courtierducoin.ca`.

Les emplacements vidéo et guide sont présents dès maintenant. Le composant utilise un état d’attente sans lecteur lourd; les URL locales pourront être ajoutées à la configuration avec un repli vers une ressource maître par campagne.
