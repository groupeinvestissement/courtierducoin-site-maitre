# Point de reprise — 2026-09-03

Statut : **MANDAT TERMINÉ — PRODUCTION LIVE — G9 PASS**

- Autorisation humaine de mise en ligne reçue.
- Branche publique : `main`.
- Commit fonctionnel publié : `4000570fcd259cd22ec536aabc45c70d7329e2e4`.
- Arbre publié : `3af83c4079d08f7b0766f2cf9c07331b1287aa22`, identique à l'arbre validé du commit source `7dc602fa365ab3870179ab3668a6a5cfd6adcc2c`.
- Déploiement fractionné conservé : cinq commits médias, puis le commit d'intégration; aucun force-push.
- 19 secteurs, 114 routes, 228 MP4 silencieux et 228 posters publiés.
- Audit public : 114/114 pages et 456/456 médias déclarés conformes; 20/20 vidéos testées par plage d'octets en 206 avec cache immutable annuel.
- Recette navigateur : Rosemont principal et quatre architectures témoins sur ordinateur et mobile; posters adaptés, aucun débordement ni erreur console, reduced-motion sans MP4.
- « Rencontrez Pierre » : affiche V3 bouche fermée, lecture avec son observée, contrôles, `preload="metadata"`, sans autoplay, VTT non activé et transcription V3 exacte.
- Correcteur indépendant G9 : PASS, aucun défaut produit détecté.
- Limite d'observabilité : l'environnement navigateur de recette impose reduced-motion et n'expose pas l'API plein écran; le scénario mouvement normal reste couvert par le test runtime local du même arbre et les fichiers publics ont été contre-vérifiés.
- Procédure de retour arrière corrigée pour la topologie Git fractionnée dans `ROLLBACK.md`; les anciens médias sont conservés.

Prochaine action : aucune. Conserver la branche de transit et les anciens médias pendant la période d'acceptation.
