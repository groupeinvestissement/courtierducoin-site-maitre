# Dictionnaire de provenance des formulaires web

Ce document est la référence des formulaires Vaudreuil-Soulanges envoyés à Bigin. Le navigateur transmet uniquement un `source_key`; `api/web-form-sources.php` valide cette clé et génère côté serveur la région, la page, le code, le type et la source détaillée. Les champs cachés historiques ne font pas autorité.

Valeurs communes :

- Lead Source : `Site web - Courtier du Coin`
- Web Source Site : `CourtierDuCoin.ca`
- Web Region : `Vaudreuil-Soulanges`

| Route | Page publique | Code | Form ID / sourceKey | Type de formulaire | Source détaillée |
|---|---|---|---|---|---|
| `/secteurs/vaudreuil-soulanges/` | Universelle | universal | `vs-universal-analysis` | Analyse de propriété | Courtier du Coin > Vaudreuil-Soulanges > Universelle > Analyse de propriété |
| `/secteurs/vaudreuil-soulanges/` | Universelle | universal | `vs-universal-guide` | Guide vendeur | Courtier du Coin > Vaudreuil-Soulanges > Universelle > Guide vendeur |
| `/vaudreuil-soulanges/o1a11/` | Options | o1a11 | `vs-options-analysis` | Faire le point - Options | Courtier du Coin > Vaudreuil-Soulanges > Options > Faire le point |
| `/vaudreuil-soulanges/o1a11/` | Options | o1a11 | `vs-options-plan-confidentiel` | Plan confidentiel | Courtier du Coin > Vaudreuil-Soulanges > Options > Plan confidentiel |
| `/vaudreuil-soulanges/02a22/` | Accompagnement | 02a22 | `vs-accompagnement-analysis` | Faire le point | Courtier du Coin > Vaudreuil-Soulanges > Accompagnement > Faire le point |
| `/vaudreuil-soulanges/02a22/` | Accompagnement | 02a22 | `vs-accompagnement-checklist` | Checklist succession | Courtier du Coin > Vaudreuil-Soulanges > Accompagnement > Checklist succession |
| `/vaudreuil-soulanges/03i33/` | Patrimoine / Investisseur | 03i33 | `vs-investisseur-analysis` | Analyse immeuble | Courtier du Coin > Vaudreuil-Soulanges > Patrimoine / Investisseur > Analyse immeuble |
| `/vaudreuil-soulanges/03i33/` | Patrimoine / Investisseur | 03i33 | `vs-investisseur-guide` | Guide vendeur de plex | Courtier du Coin > Vaudreuil-Soulanges > Patrimoine / Investisseur > Guide vendeur de plex |
| `/vaudreuil-soulanges/04m44/` | Maison | 04m44 | `vs-maison-analysis` | Analyse maison | Courtier du Coin > Vaudreuil-Soulanges > Maison > Analyse maison |
| `/vaudreuil-soulanges/04m44/` | Maison | 04m44 | `vs-maison-guide` | Guide vendeur de maison | Courtier du Coin > Vaudreuil-Soulanges > Maison > Guide vendeur de maison |
| `/vaudreuil-soulanges/05c55/` | Condo | 05c55 | `vs-condo-analysis` | Analyse condo | Courtier du Coin > Vaudreuil-Soulanges > Condo > Analyse condo |
| `/vaudreuil-soulanges/05c55/` | Condo | 05c55 | `vs-condo-guide` | Guide vendeur de condo | Courtier du Coin > Vaudreuil-Soulanges > Condo > Guide vendeur de condo |

Chaque soumission inclut aussi : `submission_id`, URL d’entrée, canonical, hôte et chemin d’entrée, referrer, first touch, last touch, UTM, GCLID, FBCLID et les deux consentements avec horodatages distincts. Une nouvelle soumission avec le même courriel met à jour le contact et ajoute un bloc d’historique; elle ne supprime pas les soumissions précédentes.

Dans Bigin, le champ humain `Web Page` vaut `Vaudreuil-Soulanges — Universelle` pour la page universelle; `Universelle` reste le nom de parcours utilisé dans la source détaillée.

## Ajouter une future région

1. Ajouter sa configuration de pages et ses routes.
2. Ajouter chaque `source_key` à la configuration serveur.
3. Utiliser ce `source_key` sur le formulaire; ne pas recopier les libellés de provenance dans la page.
4. Ajouter un seul dataset de marché vérifié et ses contrôles anti-régression.
5. Ajouter les routes au sitemap, les canoniques, les liens internes et la matrice de QA visuelle.
6. Tester la provenance dans Bigin avant toute duplication à grande échelle.
