# G1 — Vérification et copie de la release immuable

Date : 2026-09-02  
Source : `C:\Users\Samsung\Downloads\PROJECT_B_AVATAR_VIDEO\TRANSFERT_SITE_HEROS_MULTI_SECTEURS_2026-09-02\heroes-2026-08-31-v01`  
Cible publique : `/assets/video/heroes/heroes-2026-08-31-v01/`

## Verdict

**PASS.**

| Contrôle | Résultat |
|---|---:|
| Fichiers physiques source | 482 |
| Fichiers physiques copie | 482 |
| Octets source | 544 696 118 |
| Octets copie | 544 696 118 |
| Entrées payload de `MANIFEST.json` | 480/480 conformes |
| Fichiers absents, supplémentaires ou modifiés | 0 |
| SHA-256 de `MANIFEST.json` | `130525f7da1278e8bdd54037e98e63e1118bb9d97341e07f6cea57573e0b2df9` |

La comparaison source↔copie a recalculé les SHA-256 des 482 fichiers. La copie est identique octet pour octet et le dossier source n'a pas été modifié.

## Cohérence fonctionnelle

- 19/19 `web-manifest.json` valides.
- 114 routes uniques et applicables.
- 228 unités vidéo uniques.
- 456 actifs médias uniques : 228 MP4 et 228 JPEG.
- 228 MP4 H.264, 18 secondes, 30 i/s, sans piste audio, dimensions desktop/mobile conformes.
- 228 posters décodables et dimensions conformes.
- 190 crédits : 19 secteurs × 10 rôles.
- Certificat source : G0 à G8 PASS; G9 `NOT_DEPLOYED`.

Les preuves historiques externes citées par le manifeste ne sont pas toutes emballées dans la release; cette limite n'affecte ni l'intégrité du payload livré ni l'intégration Web.

