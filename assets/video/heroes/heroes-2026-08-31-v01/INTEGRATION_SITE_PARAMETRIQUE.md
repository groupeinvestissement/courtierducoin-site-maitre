# Intégration Web paramétrique — héros multi-secteurs

Statut de la livraison : **READY_FOR_SITE_INTEGRATION**  
Déploiement : **NOT_DEPLOYED**
Release immuable : **heroes-2026-08-31-v01**

## 1. Résultat attendu

Un seul composant Web sert la page principale et les cinq pages spécialisées de chacun des 19 secteurs. La portée exacte est donc :

- 19 secteurs;
- 6 variantes par secteur;
- 114 routes : 19 × 6;
- 2 formats par route : `desktop` et `mobile`;
- 228 MP4 silencieux et 228 posters JPEG;
- 4 actifs fournis au composant sur chaque route : vidéo ordinateur, vidéo téléphone, poster ordinateur et poster téléphone.

La vidéo reste décorative et ne contient aucun texte, logo, CTA, son ou avatar. Le H1, le texte, les boutons, le téléphone, le site et le courriel restent dans le HTML de chaque page.

La livraison n’a aucune dépendance HeyGen : aucun compte, crédit, SDK, jeton, appel API ou actif distant HeyGen n’est requis dans le navigateur, au build ou sur le serveur. Les MP4 et les posters sont des fichiers statiques autonomes.

`READY_FOR_SITE_INTEGRATION` autorise la prévisualisation et l’intégration par l’équipe Web. `NOT_DEPLOYED` signifie que la release n’est pas encore publique et que le gate G9 reste à fermer après une installation réelle.

## 2. Clés stables

### Secteur

Utiliser exactement le `id` de `sector-system/sector-catalog.json`, par exemple :

```text
ahuntsic-cartierville
rosemont-la-petite-patrie
villeray-saint-michel-parc-extension
```

### Profil

```text
main
o1a11
02a22
03i33
04m44
05c55
```

`o1a11` commence par une lettre minuscule `o`. `02a22` commence par le chiffre zéro.

### Format

```text
desktop -> 1920 × 1080
mobile  -> 810 × 1440
```

Le format mobile est un fichier vertical distinct, pas un simple recadrage CSS du MP4 desktop.

### Route

Les 114 routes courantes sont toutes applicables. Leur contrat est strict :

```text
main                       -> /secteurs/{sector-id}/
o1a11 à 05c55              -> /{sector-id}/{page-key}/
```

Ne pas remplacer la route principale par `/{sector-id}/` ou `/`. Ne pas modifier la casse des clés `o1a11` et `02a22`.

## 3. Manifeste sectoriel

Chaque secteur livré contient `web-manifest.json`. Le site lit les 19 manifestes au moment de la construction ou les importe dans sa configuration. Ne pas faire 19 requêtes réseau au chargement d’une page.

Exemple de structure :

```json
{
  "schemaVersion": "1.0.0",
  "releaseId": "heroes-2026-08-31-v01",
  "sectorId": "SECTOR_ID",
  "displayName": "NOM DU SECTEUR",
  "canonicalBaseUrl": "https://www.courtierducoin.ca",
  "status": "READY_FOR_SITE_INTEGRATION",
  "deploymentStatus": "NOT_DEPLOYED",
  "pages": {
    "main": {
      "route": "/secteurs/SECTOR_ID/",
      "applicable": true,
      "desktopVideo": "SECTOR_ID/main/SECTOR_ID-main-hero-desktop-web.mp4",
      "mobileVideo": "SECTOR_ID/main/SECTOR_ID-main-hero-mobile-web.mp4",
      "desktopPoster": "SECTOR_ID/main/SECTOR_ID-main-hero-desktop-poster.jpg",
      "mobilePoster": "SECTOR_ID/main/SECTOR_ID-main-hero-mobile-poster.jpg",
      "sha256": {
        "desktopVideo": "À FOURNIR PAR LA RELEASE",
        "mobileVideo": "À FOURNIR PAR LA RELEASE",
        "desktopPoster": "À FOURNIR PAR LA RELEASE",
        "mobilePoster": "À FOURNIR PAR LA RELEASE"
      }
    },
    "o1a11": {
      "route": "/SECTOR_ID/o1a11/",
      "applicable": true,
      "desktopVideo": "SECTOR_ID/o1a11/SECTOR_ID-o1a11-hero-desktop-web.mp4",
      "mobileVideo": "SECTOR_ID/o1a11/SECTOR_ID-o1a11-hero-mobile-web.mp4",
      "desktopPoster": "SECTOR_ID/o1a11/SECTOR_ID-o1a11-hero-desktop-poster.jpg",
      "mobilePoster": "SECTOR_ID/o1a11/SECTOR_ID-o1a11-hero-mobile-poster.jpg",
      "sha256": {
        "desktopVideo": "À FOURNIR PAR LA RELEASE",
        "mobileVideo": "À FOURNIR PAR LA RELEASE",
        "desktopPoster": "À FOURNIR PAR LA RELEASE",
        "mobilePoster": "À FOURNIR PAR LA RELEASE"
      }
    }
  }
}
```

Les chemins d’actifs du manifeste sont relatifs à la racine de la release. Les entrées montrées sont des jetons de documentation : ne jamais publier `SECTOR_ID`, `À FOURNIR` ou une chaîne vide. Dans la release courante, les six profils de chaque secteur portent `applicable: true` et possèdent leurs quatre actifs, soit 114/114 routes.

## 4. Arborescence de release et URL publique

Le paquet immuable est produit sous `deliverables/multi-sector-heroes/releases/{release-id}/`. Conserver l’identifiant de release dans le chemin public afin qu’un retour arrière ne dépende pas d’une purge de cache :

```text
/assets/video/heroes/{release-id}/
  MANIFEST.json
  MANIFEST.sha256
  {sector-id}/
    web-manifest.json
    {page-key}/
      {sector-id}-{page-key}-hero-desktop-web.mp4
      {sector-id}-{page-key}-hero-mobile-web.mp4
      {sector-id}-{page-key}-hero-desktop-poster.jpg
      {sector-id}-{page-key}-hero-mobile-poster.jpg
```

Résoudre chaque chemin relatif de `web-manifest.json` contre `/assets/video/heroes/{release-id}/`. Le composant ne doit pas reconstruire le nom d’un fichier à partir du secteur, car le manifeste et ses SHA-256 sont la source de vérité.

## 5. Injection côté serveur ou build

Le meilleur flux est :

```text
route de page
  -> sector-id + page-key
  -> entrée du web-manifest
  -> chemin relatif résolu contre la racine de release
  -> quatre URL injectées dans le composant
  -> JavaScript choisit un seul MP4 selon le format
```

Le H1 et les CTA proviennent du contenu de la page, pas du manifeste vidéo. Cette séparation évite un rerendu lorsque le texte change.

## 6. HTML commun

Le `<picture>` fournit un poster responsive même sans JavaScript. Le `<video>` ne possède aucun `src` initial afin d’éviter le téléchargement des deux formats.

```html
<section
  class="sector-hero"
  data-sector-hero
  data-sector-id="SECTOR_ID"
  data-page-key="main"
  data-desktop-video="/assets/video/heroes/RELEASE_ID/SECTOR_ID/main/SECTOR_ID-main-hero-desktop-web.mp4"
  data-mobile-video="/assets/video/heroes/RELEASE_ID/SECTOR_ID/main/SECTOR_ID-main-hero-mobile-web.mp4"
  data-desktop-poster="/assets/video/heroes/RELEASE_ID/SECTOR_ID/main/SECTOR_ID-main-hero-desktop-poster.jpg"
  data-mobile-poster="/assets/video/heroes/RELEASE_ID/SECTOR_ID/main/SECTOR_ID-main-hero-mobile-poster.jpg"
>
  <picture class="sector-hero__poster" aria-hidden="true">
    <source
      media="(max-width: 900px), (orientation: portrait)"
      srcset="/assets/video/heroes/RELEASE_ID/SECTOR_ID/main/SECTOR_ID-main-hero-mobile-poster.jpg"
    >
    <img
      src="/assets/video/heroes/RELEASE_ID/SECTOR_ID/main/SECTOR_ID-main-hero-desktop-poster.jpg"
      alt=""
      width="1920"
      height="1080"
      fetchpriority="high"
      decoding="async"
    >
  </picture>

  <video
    class="sector-hero__video"
    autoplay
    muted
    loop
    playsinline
    preload="metadata"
    tabindex="-1"
    aria-hidden="true"
    data-sector-hero-video
  ></video>

  <div class="sector-hero__shade" aria-hidden="true"></div>

  <div class="sector-hero__content">
    <p class="sector-hero__eyebrow">NOM RÉEL DU SECTEUR</p>
    <h1>H1 RÉEL DE LA PAGE</h1>
    <p class="sector-hero__copy">TEXTE RÉEL DE LA PAGE</p>

    <div class="sector-hero__actions">
      <a class="button button-primary" href="ANCRE_RÉELLE_DU_FORMULAIRE">
        CTA RÉEL DE LA PAGE
      </a>
      <a class="button button-ghost" href="tel:+15142164013">
        Appeler Pierre · 514 216-4013
      </a>
    </div>
  </div>
</section>
```

Conditions de build :

- refuser `RELEASE_ID`, `SECTOR_ID`, `NOM RÉEL`, `H1 RÉEL`, `CTA RÉEL`, `ANCRE_RÉELLE` et toute valeur vide;
- vérifier que les quatre URL existent dans le manifeste;
- vérifier que `data-sector-id` et `data-page-key` correspondent à la route;
- conserver un seul H1 dans la page;
- ne pas ajouter `controls` au `<video>`;
- ne pas ajouter de texte alternatif descriptif à une vidéo purement décorative.

## 7. CSS commun

```css
.sector-hero {
  position: relative;
  min-height: 720px;
  height: min(900px, 100svh);
  display: flex;
  align-items: center;
  overflow: hidden;
  isolation: isolate;
  background: #111;
  color: #fff;
}

.sector-hero__poster,
.sector-hero__poster img,
.sector-hero__video,
.sector-hero__shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.sector-hero__poster {
  z-index: -3;
  margin: 0;
}

.sector-hero__poster img {
  object-fit: cover;
  object-position: center;
}

.sector-hero__video {
  z-index: -2;
  object-fit: cover;
  object-position: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 240ms ease;
}

.sector-hero__video.is-ready {
  opacity: 1;
}

.sector-hero__shade {
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(0, 0, 0, .14), transparent 64%);
}

.sector-hero__content {
  width: min(60%, 900px);
  padding: 145px clamp(1.25rem, 7vw, 8rem) 64px;
}

.sector-hero__content h1 {
  max-width: 900px;
  text-wrap: balance;
}

.sector-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: .8rem;
  margin-top: 1.4rem;
}

.sector-hero a:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 4px;
}

@media (max-width: 700px) {
  .sector-hero {
    min-height: 720px;
    height: 100svh;
    align-items: flex-start;
  }

  .sector-hero__shade {
    background: linear-gradient(180deg, rgba(0, 0, 0, .22), transparent 58%);
  }

  .sector-hero__content {
    width: 100%;
    padding: 104px 1rem 38px;
  }

  .sector-hero__content h1 {
    max-width: 540px;
    font-size: clamp(2.25rem, 10.5vw, 3.45rem);
  }

  .sector-hero__copy,
  .sector-hero__actions .button-ghost {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sector-hero__video {
    display: none;
  }
}
```

Les médias livrés reprennent l’étalonnage visuel commun. Garder la couche CSS légère et l’augmenter seulement après un test de contraste sur les images les plus claires.

## 8. JavaScript commun

Le script ci-dessous choisit un seul format, préserve le poster si la vidéo échoue et ne charge aucun MP4 lorsque la réduction des animations est active.

```js
const heroMobileQuery = window.matchMedia(
  '(max-width: 900px), (orientation: portrait)',
);
const heroReducedMotionQuery = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
);

const requiredHeroData = [
  'sectorId',
  'pageKey',
  'desktopVideo',
  'mobileVideo',
  'desktopPoster',
  'mobilePoster',
];

const configureSectorHero = (hero) => {
  const video = hero.querySelector('[data-sector-hero-video]');
  if (!video) return;

  const missing = requiredHeroData.filter((key) => !hero.dataset[key]);
  if (missing.length > 0) {
    video.removeAttribute('src');
    video.classList.remove('is-ready');
    console.error('Sector hero data missing:', missing, hero);
    return;
  }

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;

  if (heroReducedMotionQuery.matches) {
    video.pause();
    video.removeAttribute('src');
    video.removeAttribute('poster');
    video.classList.remove('is-ready');
    delete video.dataset.loadedSrc;
    video.load();
    return;
  }

  const mobile = heroMobileQuery.matches;
  const nextSrc = mobile
    ? hero.dataset.mobileVideo
    : hero.dataset.desktopVideo;
  const nextPoster = mobile
    ? hero.dataset.mobilePoster
    : hero.dataset.desktopPoster;

  if (video.dataset.loadedSrc !== nextSrc) {
    video.pause();
    video.classList.remove('is-ready');
    video.src = nextSrc;
    video.poster = nextPoster;
    video.dataset.loadedSrc = nextSrc;
    video.load();
  }

  const reveal = () => video.classList.add('is-ready');
  const fallback = () => video.classList.remove('is-ready');

  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) reveal();
  else video.addEventListener('canplay', reveal, {once: true});

  video.addEventListener('error', fallback, {once: true});
  video.play().catch(fallback);
};

const configureAllSectorHeroes = () => {
  document
    .querySelectorAll('[data-sector-hero]')
    .forEach(configureSectorHero);
};

configureAllSectorHeroes();
heroMobileQuery.addEventListener?.('change', configureAllSectorHeroes);
heroReducedMotionQuery.addEventListener?.('change', configureAllSectorHeroes);
```

Si le site utilise un routeur client, rappeler `configureAllSectorHeroes()` après le montage de la nouvelle page et retirer les anciens écouteurs lors du démontage.

## 9. Contenu HTML par profil

Le contenu exact provient de l’audit de la page. Les libellés ci-dessous servent seulement à détecter une erreur de correspondance.

| `page-key` | Sujet attendu | CTA indicatif |
|---|---|---|
| `main` | service immobilier local du secteur | CTA réel de la page principale |
| `o1a11` | clarification d’un avis ou d’une échéance | Clarifier ma situation |
| `02a22` | organisation du dossier immobilier d’une succession | Mettre le dossier en ordre |
| `03i33` | valeur d’un plex ou immeuble à revenus | Comprendre la valeur de mon plex |
| `04m44` | préparation de la vente d’une maison | Préparer la vente de ma maison |
| `05c55` | préparation de la vente d’un condo | Préparer la vente de mon condo |

Ne pas recopier mécaniquement les H1 Rosemont. Le nom du territoire, la préposition et les détails doivent provenir de la page réelle.

## 10. Pages sensibles

Pour `o1a11` et `02a22` :

- les médias sont seulement du contexte non résidentiel;
- aucun texte alternatif, légende, crédit ou donnée structurée ne relie un lieu à un dossier réel;
- ne pas nommer une adresse résidentielle visible;
- le poster respecte les mêmes règles que la vidéo;
- le DOM ne contient aucune affirmation du type « propriété montrée »;
- une note de crédits peut préciser que les vues n’illustrent pas des dossiers ou inscriptions réels.

## 11. Accessibilité

- Vidéo : `aria-hidden="true"`, `tabindex="-1"`, aucun `controls`.
- Poster : image décorative avec `alt=""` et conteneur caché aux technologies d’assistance.
- H1 : un seul par page.
- CTA : vrais liens HTML, état `:focus-visible`, cible tactile minimale 44 × 44 px.
- Réduction des animations : poster seulement, aucun téléchargement vidéo.
- Erreur réseau ou JavaScript absent : poster et contenu HTML utilisables.
- Aucun contenu essentiel dans les images.
- Aucun balisage `VideoObject` pour une boucle décorative silencieuse.

## 12. Performance et serveur

### En-têtes

```text
MP4  -> Content-Type: video/mp4
JPG  -> Content-Type: image/jpeg
```

- Activer les requêtes par plage d’octets pour les MP4.
- Ne pas compresser les MP4 avec Gzip ou Brotli.
- Utiliser un nom versionné avant `Cache-Control: public, max-age=31536000, immutable`.
- Si le nom n’est pas versionné, employer un cache plus court et prévoir l’invalidation.
- Conserver `preload="metadata"`.
- Ne pas précharger les héros d’autres routes.
- Mesurer LCP et CLS avec réseau mobile simulé.
- Si le MP4 pénalise le LCP, afficher le poster immédiatement et retarder le chargement vidéo après le premier rendu ou une période d’inactivité.

### Budgets

| Actif | Plafond normal |
|---|---:|
| MP4 desktop | 12 Mio |
| MP4 mobile | 6 Mio |
| Poster desktop | 400 Kio |
| Poster mobile | 350 Kio |

Tout dépassement exige une justification dans le manifeste et un test de qualité comparatif.

## 13. Validation avant déploiement

- [ ] La release porte `READY_FOR_SITE_INTEGRATION`.
- [ ] La release livrée porte encore `NOT_DEPLOYED`; aucun déploiement n’est présumé.
- [ ] Les 19 manifestes sectoriels et les 114 entrées de route sont présents.
- [ ] Les 114 routes possèdent chacune les formats `desktop` et `mobile`.
- [ ] Le manifeste correspond au secteur et à la route.
- [ ] Les quatre fichiers du profil existent.
- [ ] Les SHA-256 correspondent au paquet.
- [ ] Le H1 et les CTA proviennent de la bonne page.
- [ ] Le téléphone utilise `tel:+15142164013` si cette donnée est toujours confirmée.
- [ ] Le courriel et le domaine sont ceux du catalogue/site courant.
- [ ] Une seule vidéo est téléchargée.
- [ ] Le mobile est utilisé à 900 px et moins ou en orientation portrait.
- [ ] Aucun MP4 n’est chargé avec réduction des animations.
- [ ] Le poster s’affiche sans JavaScript.
- [ ] Le poster s’affiche après erreur vidéo.
- [ ] La vidéo est muette, en boucle, inline et sans contrôles.
- [ ] Aucun SDK, appel réseau, jeton ni actif HeyGen n’est utilisé.
- [ ] Aucun texte, CTA ou logo n’est brûlé dans le média.
- [ ] Aucun chevauchement à 360, 390, 430, 768, 900, 1024, 1280 et 1920 px.
- [ ] Le contraste est vérifié à 1, 5, 9, 13 et 17 secondes.
- [ ] Les crédits du secteur sont accessibles.
- [ ] Les pages sensibles ne désignent aucune propriété réelle.
- [ ] Les réponses HTTP, MIME, cache et plages d’octets sont correctes.

## 14. Déploiement progressif

1. Déployer un seul secteur hors production ou sous URL de prévisualisation.
2. Tester les six profils applicables et les deux formats.
3. Fermer la vérification serveur et Lighthouse.
4. Déployer un secteur du lot.
5. Surveiller erreurs 404/416, lecture vidéo, LCP et CTA.
6. Déployer les autres secteurs du lot seulement si le premier reste stable.
7. Conserver l’ancienne image/vidéo jusqu’à la fin du lot.
8. Après inspection réelle des 114 routes, consigner `LIVE` dans le registre ou la configuration de déploiement du site; ne pas modifier la release immuable, qui conserve son état de livraison `READY_FOR_SITE_INTEGRATION` / `NOT_DEPLOYED`.

## 15. Retour arrière

Le retour arrière doit être possible sans toucher au H1, au texte ou aux CTA :

1. conserver le poster précédent ou le hero statique;
2. retirer seulement le `src` vidéo ou rétablir l’ancien manifeste;
3. invalider le cache du manifeste si nécessaire;
4. vérifier que le poster et le contenu HTML demeurent visibles;
5. consigner la version retirée et la cause;
6. corriger la seule unité fautive;
7. redéployer une nouvelle version nommée, sans écraser l’ancienne.

## 16. Activation d’un secteur de la release

1. Confirmer l’entrée du catalogue et le domaine canonique.
2. Confirmer les six routes applicables.
3. Importer `web-manifest.json` de la release acceptée.
4. Mapper chaque route vers `sector-id/page-key`.
5. Injecter les quatre actifs dans le composant commun.
6. Injecter le vrai contenu HTML de la page.
7. Exécuter les tests de build contre les jetons et chemins manquants.
8. Tester en prévisualisation.
9. Déployer progressivement.
10. Fermer le gate après déploiement et documenter le retour arrière.
