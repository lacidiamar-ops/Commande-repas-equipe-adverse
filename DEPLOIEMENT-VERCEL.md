# Déploiement — GitHub puis Vercel

Cette version remplace l'envoi manuel sur Cloudflare Workers par un déploiement
automatique : chaque fois que vous poussez sur la branche `main`, Vercel
reconstruit et met le site en ligne tout seul, en une minute environ.

## 1. Déposer les fichiers sur GitHub

Dépôt : **lacidiamar-ops/Commande-repas-equipe-adverse**, branche `main`.

Depuis l'interface web de GitHub :

1. Ouvrir le dépôt, puis **Add file → Upload files**.
2. Déposer **tout le contenu de ce dossier** (index.html, sw.js, vercel.json,
   manifest.webmanifest, les icônes, le dossier `assets/`, le dossier `scripts/`,
   package.json et les notices). Les fichiers existants seront remplacés.
3. Message de commit suggéré :
   `V44 — gamme biscuiterie Nākd. & Nuttree, emmental français, familles repliées, avis clients`
4. **Commit changes** directement sur `main`.

⚠️ Vérifier que `assets/catalogue/` contient bien les cinq nouveaux visuels :
`biscuiterie-nakd-myrtille.webp`, `biscuiterie-nakd-framboise.webp`,
`biscuiterie-nakd-cacahuete.webp`, `biscuiterie-nuttree-choco-noisette.webp`,
`biscuiterie-nuttree-pomme-cannelle.webp`.

## 2. Relier le dépôt à Vercel (à faire une seule fois)

1. Se connecter sur **vercel.com** avec le compte GitHub.
2. **Add New… → Project**, choisir le dépôt `Commande-repas-equipe-adverse`,
   puis **Import**.
3. Réglages à laisser tels quels :
   - Framework Preset : **Other**
   - Root Directory : `./`
   - Build Command : **vide** (site statique, rien à compiler)
   - Output Directory : **vide**
4. **Deploy**. Au bout d'une minute, Vercel affiche l'adresse du site
   (`…​.vercel.app`).

À partir de là, chaque nouveau commit sur `main` déclenche un déploiement
automatique. Aucun envoi manuel n'est nécessaire.

### Nom de domaine

Dans **Settings → Domains** du projet Vercel, on peut ajouter un domaine
personnalisé. Tant qu'il n'y en a pas, l'adresse `…​.vercel.app` fonctionne
normalement, y compris pour l'installation de l'application sur téléphone.

## 3. Après le premier déploiement

- Ouvrir le site et vérifier en bas de l'accueil la mention de version.
- Sur un téléphone déjà équipé de l'ancienne version Cloudflare : désinstaller
  l'icône de l'écran d'accueil, puis réinstaller depuis la nouvelle adresse.
  Le numéro de version du service worker est passé à **44**, les anciens caches
  sont donc remplacés automatiquement au premier chargement.
- Transmettre la nouvelle adresse aux clubs : les liens WhatsApp déjà envoyés
  pointent encore vers l'ancienne adresse Cloudflare.

## 4. Ancien hébergement Cloudflare

Ne pas supprimer immédiatement le Worker Cloudflare : les clubs qui ont reçu un
lien avant la bascule continueront de l'utiliser quelques jours. Une fois toutes
les commandes en cours archivées, le Worker peut être mis hors service.

## 5. Vérification avant de pousser

Depuis le dossier, si Node est disponible :

```
npm test
```

Le contrôle attendu est : `PASS 27 catalogue and workflow checks`.

## Base de données

Aucune manipulation n'est nécessaire : la base Supabase et la fonction serveur
`stadium-orders` (version 25) sont déjà à jour et partagées par les deux
hébergements. La table `stc_reviews` reçoit les avis clients.
