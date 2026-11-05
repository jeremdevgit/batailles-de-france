#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later — Copyright (C) 2026 jeremdevgit — voir LICENSE
"""Construit la version hors ligne du jeu : un seul fichier HTML autonome, dans dist/.

Usage : python3 construire.py        (Python 3.8 ou plus récent, aucune dépendance)

La version hors ligne contient tout le jeu (solo contre l'IA, deux joueurs sur le même ordinateur, simulation,
éditeur de cartes) avec ses polices et son icône. Le mode en ligne et le classement, qui demandent le serveur de
jeu (app/main.py), y sont désactivés proprement. Sa politique de sécurité (CSP) n'autorise que le script dont
l'empreinte SHA-256 correspond exactement au code de ce dépôt, et aucune connexion réseau.
"""
import base64
import hashlib
import pathlib
import re

RACINE = pathlib.Path(__file__).resolve().parent
STATIQUE = RACINE / "app" / "static"
DEPOT = "github.com/jeremdevgit/batailles-de-france"

# Messages propres à la version hors ligne (remplacent ceux qui supposent un serveur)
REMPLACEMENTS = [
    ('const NET_NA="Serveur de jeu injoignable. Vérifiez votre connexion internet puis rechargez la page.";',
     f'const NET_NA="Version hors ligne : le jeu en ligne et le mode classé demandent le serveur de jeu (voir {DEPOT}). '
     'Ici : solo, deux joueurs sur le même ordinateur, simulation et éditeur de cartes.";'),
    ("Classement indisponible : serveur injoignable.", "Le classement est disponible dans la version en ligne du jeu."),
]


def data_uri(chemin: pathlib.Path, mime: str) -> str:
    return f"data:{mime};base64," + base64.b64encode(chemin.read_bytes()).decode("ascii")


def main() -> None:
    html = (STATIQUE / "index.html").read_text(encoding="utf-8")
    jeu = (STATIQUE / "jeu.js").read_text(encoding="utf-8")
    for avant, apres in REMPLACEMENTS:
        if jeu.count(avant) != 1:
            raise SystemExit(f"Texte introuvable dans jeu.js : {avant[:60]}…")
        jeu = jeu.replace(avant, apres)
    jeu = jeu.replace("</script", "<\\/script")
    empreinte = "'sha256-" + base64.b64encode(hashlib.sha256(jeu.encode("utf-8")).digest()).decode("ascii") + "'"

    html = html.replace('href="/static/icone.svg"', f'href="{data_uri(STATIQUE / "icone.svg", "image/svg+xml")}"')
    html = re.sub(r"url\(/static/(polices/[a-z0-9-]+\.woff2)\)", lambda m: f"url({data_uri(STATIQUE / m.group(1), 'font/woff2')})", html)
    # Sans serveur, pas de client réseau : le jeu désactive alors lui-même le mode en ligne
    html, n1 = re.subn(r'<script src="/static/reseau\.js"></script>\s*', "", html)
    html, n2 = re.subn(r'<script src="/static/jeu\.js"></script>', lambda m: f"<script>{jeu}</script>", html)
    if (n1, n2) != (1, 1):
        raise SystemExit("Balises de script introuvables dans index.html")

    csp = ("default-src 'none'; script-src " + empreinte + "; style-src 'unsafe-inline'; img-src data: blob:; "
           "font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'")
    html = html.replace('<meta charset="utf-8">', f'<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="{csp}">', 1)

    sans_script = re.sub(r"<script>.*?</script>", "", html, flags=re.S)
    restes = re.findall(r'(?:src|href)="(?!data:|#|https?://)([^"]+)"|url\((?!data:)([^)]+)\)', sans_script)
    if restes:
        raise SystemExit(f"Ressources non intégrées : {restes}")

    sortie = RACINE / "dist" / "Batailles-de-France-hors-ligne.html"
    sortie.parent.mkdir(exist_ok=True)
    sortie.write_text(html, encoding="utf-8")
    somme = hashlib.sha256(sortie.read_bytes()).hexdigest()
    (RACINE / "dist" / "SHA256SUMS.txt").write_text(f"{somme}  {sortie.name}\n", encoding="utf-8")
    print(f"{sortie.relative_to(RACINE)}  ({sortie.stat().st_size // 1024} Ko)\ndist/SHA256SUMS.txt")


if __name__ == "__main__":
    main()
