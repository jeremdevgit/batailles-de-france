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
