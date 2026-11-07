# Historique des versions

## 1.1.1 — 2026-11-07 — Sécurité / Security

- Chargeur de traductions à chemins constants ; dictionnaires réseau sans prototype ; contrôle des balises script insensible à la casse.
- Use constant translation paths and prototype-free network dictionaries; handle script tag case in offline resource checks.
- Le build Docker échoue désormais si les mises à jour système, les dépendances Python ou la préparation des droits échouent. Seule la désinstallation optionnelle des outils de packaging tolère un échec.
- Docker builds now fail when system updates, Python dependencies or permission setup fail. Only optional packaging-tool removal tolerates errors.
- Le jeu hors ligne ne change pas. / The offline game is unchanged.


## 1.1.0 — 2026-11-06

**English**

- **8 languages**: English, French, Spanish, German, Italian, Portuguese, Chinese and Japanese, picked automatically from the browser, with a menu on the home screen.
- Online games: shared messages (log, banners, end of game) are sent as templates and shown to each player in their own language.
- Numbers formatted for the chosen language; translations loaded one language at a time (about 90 KB) on the server version, all included in the offline file.

**Français**

- **8 langues** : français, anglais, espagnol, allemand, italien, portugais, chinois et japonais, choisies selon le navigateur, avec un menu sur l'écran d'accueil.
- Parties en ligne : les messages partagés (journal, bannières, fin de partie) voyagent sous forme de modèles et s'affichent dans la langue de chaque joueur.
- Nombres affichés selon la langue choisie ; une seule langue chargée à la fois (environ 90 Ko) sur la version serveur, toutes incluses dans le fichier hors ligne.

## 2026-11-05 — Publication open source

- Écran d'accueil : « Créé par jeremdevgit » et liens vers les autres logiciels de l'auteur.
- Code publié sous licence GNU GPL v3 ou ultérieure.
- Sécurité : le texte venant des autres joueurs (carte de l'hôte, commandes, carte importée dans l'éditeur, cartes enregistrées) est neutralisé avant tout affichage ; le pseudo du classement est aussi nettoyé côté serveur.
- Sécurité : l'adresse réelle des joueurs n'est acceptée que des proxys déclarés (`FORWARDED_ALLOW_IPS`) ; requêtes trop volumineuses refusées avant lecture ; liste anti-abus purgée régulièrement ; en-têtes de sécurité (CSP stricte, anti-iframe, nosniff) envoyés par le serveur.
- Polices embarquées : plus aucune requête vers un service tiers.
- Version hors ligne reconstructible avec `construire.py`, script autorisé par son empreinte SHA-256.
- Réglages par variables d'environnement, image Docker et `docker-compose.yml` génériques.

## Batailles de France — 2026-10-27

- Le jeu s'étend à 5 villes : Lyon, Paris, Marseille, Bordeaux et Strasbourg.
- Nouveau mode classé : recherche automatique d'un adversaire, rangs de Recrue à Maréchal et classement des joueurs.
- Parties en ligne à 2 contre 2, avec votes pour la vitesse et la pause.
- Interface repensée pour téléphone et tablette.
- Version hors ligne à télécharger.

## Première version (nom d'origine : Bataille de Lyon) — 2026-10-18

- Mise en ligne du jeu, ouvert à tous sans compte.
- Parties en ligne entre amis grâce à un code à 5 caractères.
