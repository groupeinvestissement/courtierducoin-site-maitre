# Rapport QA MASTER — Vaudreuil-Soulanges

Date de vérification : 11 août 2026

Portée : 6 pages, 12 formulaires, ordinateur et mobile.

## A. Audit initial

- La provenance Bigin était trop générique et dépendait de valeurs envoyées par le navigateur.
- Plusieurs statistiques anciennes étaient encore copiées dans les pages.
- Les formulaires n’avaient pas tous un identifiant métier unique, des consentements séparés et un historique first/last touch.
- La page Options contenait des cartes de confidentialité avec du texte blanc sur fond blanc (ratio mesuré : 1,0:1).
- Les étapes masquées des formulaires progressifs pouvaient redevenir visibles à cause d’une règle de grille plus spécifique que l’attribut `hidden`.
- Les routes existaient dans le sitemap, mais l’attribution du sous-domaine marketing était perdue après redirection.

## B. Fichiers modifiés

| Fichier | Raison | Risque | Vérification |
|---|---|---|---|
| `api/contact.php` | Validation serveur, provenance Bigin, déduplication, historique, consentements | Élevé | Validation statique + 12 essais réels après déploiement |
| `api/web-form-sources.php` | Référence autoritaire des 12 sources | Élevé | 12 clés uniques et concordance page/code/type |
| `vaudreuil-master.js` | Enrichissement des soumissions, first/last touch, UTM, stats partagées | Élevé | `node --check`, navigateur et formulaires |
| `vaudreuil-master.css` | Contraste, focus, erreurs, consentements, étapes masquées | Moyen | 30 captures + Lighthouse |
| `data/vaudreuil-soulanges-market.json` | Dataset Centris unique | Élevé | Contrôle exact des valeurs et anti-régression |
| 6 fichiers `index.html` | Contenu, formulaires, SEO, données structurées, stats | Moyen | Validation MASTER + navigateur |
| `.htaccess` | Conservation de l’origine marketing avec `entry` | Moyen | Contrôle des règles et redirections publiques |
| 2 images WebP Options/Accompagnement | Réduction de 351 426 à 188 048 octets chacune | Faible | Capture et Lighthouse mobile |
| `docs/web-lead-source-dictionary.md` | Dictionnaire CRM et procédure future région | Faible | Relecture des 12 mappings |
| `validate-vaudreuil-master.mjs` | Tests SEO, sources, schémas, stats et fuites Rosemont | Faible | Exécution réussie |

## C. Provenance CRM

La table complète est dans `docs/web-lead-source-dictionary.md`. Chaque soumission contient une clé unique validée côté serveur. Le serveur injecte la région, la page, le code, le type, la source détaillée, les URL, first/last touch, UTM et les horodatages de consentement. Une nouvelle soumission avec le même courriel ajoute un historique et crée une nouvelle opportunité sans écraser les soumissions précédentes. Le champ Bigin `Lead Source` est également alimenté avec `Site web - Courtier du Coin`.

## D. Essais des 12 formulaires

| Form ID | Résultat HTTP | Résultat CRM |
|---|---:|---|
| `vs-universal-analysis` | 200 — réussi | Opportunité Bigin créée |
| `vs-universal-guide` | 200 — réussi | Opportunité Bigin créée |
| `vs-options-analysis` | 200 — réussi | Opportunité Bigin créée |
| `vs-options-plan-confidentiel` | 200 — réussi | Opportunité Bigin créée |
| `vs-accompagnement-analysis` | 200 — réussi | Opportunité Bigin créée |
| `vs-accompagnement-checklist` | 200 — réussi | Opportunité Bigin créée |
| `vs-investisseur-analysis` | 200 — réussi | Opportunité Bigin créée |
| `vs-investisseur-guide` | 200 — réussi | Opportunité Bigin créée |
| `vs-maison-analysis` | 200 — réussi | Opportunité Bigin créée |
| `vs-maison-guide` | 200 — réussi | Opportunité Bigin créée |
| `vs-condo-analysis` | 200 — réussi | Opportunité Bigin créée |
| `vs-condo-guide` | 200 — réussi | Opportunité Bigin créée et provenance confirmée |

Preuve CRM : contact d’essai Bigin `…494370`, 13 opportunités ouvertes après les 12 essais et le retest final du guide Condo. La fiche affiche `Lead Source : Site web - Courtier du Coin` et l’historique confirme la création de l’opportunité.

## E. Contraste et accessibilité

- Options, cartes de confidentialité : 1,0:1 avant correction; aucune violation de texte normal au second audit.
- Marque décorative rouge « C » : 3,4:1, conforme au seuil graphique de 3:1.
- Liens, texte secondaire, placeholders, consentements, erreurs, focus, footer et barre mobile corrigés dans la feuille commune.
- 0 champ sans libellé, 0 bouton/lien sans nom, 0 saut de niveau de titre et 0 débordement horizontal sur les 12 vues contrôlées.
- Audits axe intégrés à Lighthouse : 0 problème critique et 0 problème sérieux non accepté.

## F. Lighthouse

| Page | Mobile P/A/BP/SEO | Ordinateur P/A/BP/SEO | LCP mobile | CLS mobile |
|---|---|---|---:|---:|
| Universelle | 94 / 100 / 100 / 100 | 100 / 96 / 100 / 100 | 3,1 s | 0,043 |
| Options | 88 / 100 / 100 / 100 | 100 / 96 / 100 / 100 | 3,4 s | 0 |
| Accompagnement | 90 / 96 / 100 / 100 | 100 / 96 / 100 / 100 | 3,5 s | 0 |
| Patrimoine / Investisseur | 90 / 96 / 100 / 100 | 100 / 96 / 100 / 100 | 3,6 s | 0 |
| Maison | 93 / 96 / 100 / 100 | 100 / 96 / 100 / 100 | 3,2 s | 0 |
| Condo | 95 / 96 / 100 / 100 | 100 / 96 / 100 / 100 | 3,0 s | 0 |

Toutes les performances dépassent la cible de 85. Les scores d’accessibilité sont de 96 à 100, le SEO et les bonnes pratiques sont à 100 sur les 12 rapports.

## G. Données de marché

Source unique : `data/vaudreuil-soulanges-market.json`.

Source publique : Centris, secteur statistique Vaudreuil-Soulanges, T2 2026.

Vérification : 11 août 2026.

Consommateurs : Universelle, Options, Patrimoine / Investisseur, Maison et Condo.

La note distingue clairement les 14 municipalités du périmètre Centris des 23 municipalités administratives de la MRC. Les anciennes valeurs interdites ne sont plus présentes.

## H. SEO et indexabilité

- 6 titres uniques, 6 H1 uniques, 6 canoniques exactes.
- `index,follow` sur les 6 pages.
- 6 URL présentes dans `sitemap.xml`.
- Données structurées valides : WebPage, BreadcrumbList, Person, Organization, RealEstateAgent et VideoObject.
- Aucun résidu visible Rosemont/Masson/Angus.
- Redirections du sous-domaine vers les canoniques avec conservation de l’entrée marketing.
- Search Console vérifié sur la propriété de domaine `courtierducoin.ca` : la page Universelle était déjà indexée; les 5 pages spécialisées étaient inconnues de Google et ont toutes été ajoutées à la file d’exploration prioritaire le 11 août 2026. Une nouvelle demande a aussi été envoyée pour la page Universelle afin de faire prendre en compte la version publiée.

## I. Captures visuelles

30 captures sont dans `qa/vaudreuil-master/screenshots` : pleine page, Hero et formulaire mobile pour chacune des 6 pages. La preuve CRM finale est dans `qa/vaudreuil-master/screenshots/crm-bigin-lead-source-proof.png`. Les 12 rapports Lighthouse sont dans `qa/vaudreuil-master/lighthouse`.

## J. Sources officielles vérifiées

- Centris : https://www.centris.ca/fr/outils/statistiques-immobilieres/vaudreuil-soulanges
- Gouvernement du Québec — copropriétés : https://www.quebec.ca/habitation-territoire/achat-vente/condos-coproprietes/mesures-coproprietes
- OACIQ — préavis d’exercice : https://www.oaciq.com/fr/titulaires-de-permis/guides-pratiques-professionnelles/guide-credit-hypothecaire/exercice-droits-hypothecaires/preavis-d-exercice-d-un-droit-hypothecaire/
- OACIQ — certificat de localisation : https://www.oaciq.com/fr/grand-public/vendre/certificat-de-localisation-datant-de-plus-de-10-ans-ce-quil-faut-savoir/
- MRC de Vaudreuil-Soulanges — vente pour taxes : https://mrcvs.ca/municipalites/vente-pour-taxes/

## K. Éléments restant hors code

- Les vidéos définitives demeurent à fournir par le propriétaire; les emplacements et métadonnées sont prêts.
