# Security

**English** · [Français](#sécurité)

## Reporting a vulnerability

Please **do not** open a public issue for a security flaw.
Use GitHub's private reporting: the repository's **Security** tab → **Report a vulnerability**.
Describe the problem, the steps to reproduce it and, if possible, a suggested fix.
The fix will ship in a new release, crediting you if you agree.

## Supported versions

Only the latest release receives fixes.

## Scope

The game server (`app/main.py`), the client (`app/static/`), the Docker image and the offline version.

## Known limitations (by design)

- The leaderboard relies on results reported by browsers; the server only checks they are plausible (one game at a time, at most 100 points difference). A player who modifies their client can cheat on their own ranking.
- In an online game, the host's computer simulates the game and is authoritative for guests.
- Online games are not end-to-end encrypted: confidentiality relies on the HTTPS of the proxy in front of the server.

## Hosting recommendations

- Always serve the game over HTTPS, behind a proxy that forwards WebSockets.
- Never set `FORWARDED_ALLOW_IPS` to `*` if the server port can be reached without going through the proxy.
- Keep the image up to date: `docker compose build --pull && docker compose up -d`.

---

# Sécurité

## Signaler une vulnérabilité

Merci de **ne pas** ouvrir de ticket public pour une faille de sécurité.
Utilise le signalement privé de GitHub : onglet **Security** du dépôt → **Report a vulnerability**.
Décris le problème, les étapes pour le reproduire et, si possible, une piste de correction.
La correction sera publiée dans une nouvelle version, avec ton accord pour être cité.

## Versions suivies

Seule la dernière version publiée reçoit des correctifs.

## Périmètre

Sont concernés : le serveur de jeu (`app/main.py`), le client (`app/static/`), l'image Docker et la version hors ligne.

## Limites connues (par conception)

- Le classement repose sur les résultats déclarés par les navigateurs ; le serveur n'en vérifie que la vraisemblance (une partie à la fois, au plus 100 points d'écart). Un joueur qui modifie son client peut tricher sur son propre classement.
- En partie en ligne, l'ordinateur de l'hôte simule la partie et fait autorité pour les invités.
- Les parties en ligne ne sont pas chiffrées de bout en bout : la confidentialité repose sur le HTTPS du proxy placé devant le serveur.

## Recommandations d'hébergement

- Toujours servir le jeu en HTTPS, derrière un proxy qui transmet les WebSockets.
- Ne jamais régler `FORWARDED_ALLOW_IPS` sur `*` si le port du serveur est joignable sans passer par le proxy.
- Garder l'image à jour : `docker compose build --pull && docker compose up -d`.
