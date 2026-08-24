import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFileSync(path.join(root, relative));
const text = (relative) => read(relative).toString('utf8');
const sha256 = (relative) => createHash('sha256').update(read(relative)).digest('hex').toUpperCase();
const errors = [];
const requireText = (value, token, label) => {
  if (!value.includes(token)) errors.push(`${label}: contenu absent: ${token}`);
};

const media = [
  {
    file: 'assets/video/rosemont/avatar-v3/rosemont-rencontrez-pierre-v3-web-720p.mp4',
    size: 11_733_249,
    hash: 'D67E16DBBB3C65C9A7AEA733CAC42605E3A913CE0E8F41E37F366E3D87DDD377',
  },
  {
    file: 'assets/video/rosemont/avatar-v3/rosemont-rencontrez-pierre-v3-poster.jpg',
    size: 121_207,
    hash: '11FC8A2E94BCDA2461D1BEC87ACE75F521D4F1A5A80018459107351B19D02784',
  },
  {
    file: 'assets/video/rosemont/avatar-v3/rosemont-rencontrez-pierre-v3-captions-fr-ca.vtt',
    size: 1_293,
    hash: 'E267CE45DD06C6997F6644CBDDD9E74CE3E4E845EF442B0C2FF420712A57CFC9',
  },
];

for (const item of media) {
  try {
    if (statSync(path.join(root, item.file)).size !== item.size) errors.push(`${item.file}: taille incorrecte`);
    if (sha256(item.file) !== item.hash) errors.push(`${item.file}: SHA-256 incorrect`);
  } catch {
    errors.push(`${item.file}: fichier absent`);
  }
}

const heroBaselines = [
  ['assets/video/rosemont/rosemont-hero-background-desktop-web.mp4', 'E4EB5B718AEA2651AD3DB1761C84DB8534FF5B63F6DEEBA13A04BAB7D86410A0'],
  ['assets/video/rosemont/rosemont-hero-background-mobile-web.mp4', '546F776C3C21EAE1595045B3D92E91016F447CE9311979022315EF6A63CB0E94'],
  ['assets/video/rosemont/rosemont-hero-background-desktop-poster.jpg', '2A4BEB69050EDF868963BE71D1F685364E4FFC6DF8742C32FACD05B7065F96E0'],
  ['assets/video/rosemont/rosemont-hero-background-mobile-poster.jpg', '70B361E88F58EF64F569E09019D4ECBA410FFBDF5BA98058F863BD5355C8AAC5'],
];

for (const [file, hash] of heroBaselines) {
  try {
    if (sha256(file) !== hash) errors.push(`${file}: le premier héros Rosemont a changé`);
  } catch {
    errors.push(`${file}: média du premier héros absent`);
  }
}

const page = text('secteurs/rosemont-la-petite-patrie/index.html');
const video = page.match(/<video\b[^>]*data-presentation-video[^>]*>[\s\S]*?<\/video>/i)?.[0] ?? '';
if (!video) errors.push('lecteur data-presentation-video absent');

for (const attribute of ['controls', 'playsinline']) {
  if (!new RegExp(`\\b${attribute}\\b`, 'i').test(video)) errors.push(`lecteur: attribut ${attribute} absent`);
}
requireText(video, 'preload="metadata"', 'lecteur');
requireText(video, 'poster="/assets/video/rosemont/avatar-v3/rosemont-rencontrez-pierre-v3-poster.jpg"', 'lecteur');
requireText(video, '<source src="/assets/video/rosemont/avatar-v3/rosemont-rencontrez-pierre-v3-web-720p.mp4" type="video/mp4">', 'lecteur');
requireText(video, '<track kind="captions" src="/assets/video/rosemont/avatar-v3/rosemont-rencontrez-pierre-v3-captions-fr-ca.vtt" srclang="fr-CA" label="Français">', 'lecteur');

for (const forbidden of ['autoplay', 'muted', 'loop', 'default']) {
  if (new RegExp(`\\b${forbidden}\\b`, 'i').test(video)) errors.push(`lecteur: attribut interdit ${forbidden}`);
}

for (const oldText of [
  'Vidéo locale en préparation',
  'L’emplacement est prêt; aucun lecteur lourd n’est chargé.',
  'Bonjour, ici Pierre Dalpé. Si vous êtes propriétaire',
]) {
  if (page.includes(oldText)) errors.push(`ancienne mention encore présente: ${oldText}`);
}

const transcript = [
  'Un projet immobilier, ça commence rarement par une pancarte.',
  'Ça commence par comprendre où vous êtes,',
  'ce que vous voulez vraiment, les options qui font du sens pour vous.',
  'Moi, c’est Pierre Dalpé. Je suis courtier immobilier résidentiel et commercial.',
  'Ma façon de travailler, c’est simple :',
  'j’écoute d’abord, je regarde les faits,',
  'puis je vous explique les choses clairement,',
  'sans pression et sans réponse toute faite.',
  'On regarde ensemble la propriété, le marché, les travaux qui valent la peine d’être faits,',
  'puis l’échéancier aussi,',
  'puis surtout vos priorités, votre réalité.',
  'Même si votre projet n’est pas pour tout de suite,',
  'vous pouvez m’appeler ou m’écrire.',
  'On fait le point simplement,',
  'et on voit à ce moment ce qui fait du sens pour vous.',
];
for (const paragraph of transcript) requireText(page, `<p>${paragraph}</p>`, 'transcription');

const script = text('rosemont-master.js');
requireText(script, "[data-presentation-video]')?.addEventListener('play'", 'suivi vidéo');
requireText(script, '{once:true}', 'suivi vidéo');
if (script.includes("[data-video]')?.addEventListener('click'")) errors.push('suivi vidéo: ancien suivi au clic encore présent');

const css = text('rosemont-hero-video.css');
for (const selector of ['.rosemont-avatar-player', '.rosemont-avatar-player video', '.rosemont-avatar-transcript p']) {
  requireText(css, selector, 'CSS lecteur');
}

const htaccess = text('.htaccess');
requireText(htaccess, 'AddType text/vtt .vtt', '.htaccess');
requireText(htaccess, 'mp4|jpe?g|vtt', '.htaccess');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log('PASS: vidéo Rosemont Avatar V3, transcription, accessibilité et premier héros conformes.');
