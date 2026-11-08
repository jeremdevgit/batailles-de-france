# SPDX-License-Identifier: GPL-3.0-or-later — Copyright (C) 2026 jeremdevgit — voir LICENSE
"""Batailles de France — serveur de jeu.

Sert le jeu (fichiers statiques), relaie les messages des parties en ligne entre joueurs (WebSocket /ws)
et tient le classement du mode classé (/api/classement, base SQLite).
Le serveur ne calcule rien : l'hôte simule la partie, l'invité reçoit l'état.
Pas de compte : chaque navigateur a un jeton aléatoire ; son identifiant public = empreinte du jeton.

Configuration (variables d'environnement) :
  BDF_STATIQUE         dossier des fichiers du jeu (défaut : /app/static)
  BDF_DONNEES          dossier de la base du classement (défaut : /donnees)
  FORWARDED_ALLOW_IPS  proxys autorisés à transmettre l'adresse réelle des joueurs (réglage d'Uvicorn,
                       défaut : 127.0.0.1). Ne jamais mettre « * » si le serveur est joignable sans proxy.
"""
import asyncio
import hashlib
import json
import os
import re
import secrets
import sqlite3
import time
from collections import defaultdict

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from limiteur_ecritures import LimiteurEcritures

STATIQUE = os.environ.get("BDF_STATIQUE", "/app/static")
BASE = os.path.join(os.environ.get("BDF_DONNEES", "/donnees"), "classement.db")
NOM_SALON = re.compile(r"^bdl-[a-z0-9]{5,11}$")
ACCUEIL = "accueil"        # salle d'accueil : présence seulement (recherche d'adversaire du mode classé)
RE_JETON = re.compile(r"^[a-f0-9]{48}$")
RE_ID = re.compile(r"^[a-f0-9]{16}$")
SALONS_MAX = 300           # parties ouvertes en même temps
JOUEURS_PAR_SALON = 6      # 2 contre 2 + marge
ACCUEIL_MAX = 500
CONNEXIONS_PAR_IP = 20     # chaque onglet ouvre l'accueil + une partie
TAILLE_MAX = 16 * 1024     # un morceau de message du jeu fait au plus ~3,3 Ko
PRESENCE_MAX = 300
DEBIT = 150                # messages / s par joueur (l'hôte envoie ~40 / s)
RAFALE = 400
INACTIVITE = 120           # s sans aucun message -> déconnexion (sauf accueil : ping du serveur)
ECRITURES_PAR_MIN = 20
CORPS_MAX = 4096           # octets acceptés pour une écriture au classement

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
CSP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; "
       "connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'; object-src 'none'")


@app.middleware("http")
async def entetes_de_securite(req: Request, suite):
    """En-têtes de sécurité posés par le serveur lui-même (protection même sans proxy devant)."""
    rep = await suite(req)
    for k, v in (("Content-Security-Policy", CSP), ("X-Content-Type-Options", "nosniff"), ("Referrer-Policy", "no-referrer"),
                 ("X-Frame-Options", "DENY"), ("Permissions-Policy", "camera=(), microphone=(), geolocation=()")):
        rep.headers.setdefault(k, v)
    return rep

app.mount("/static", StaticFiles(directory=STATIQUE), name="static")

salons: dict[str, dict[str, dict]] = {}
par_ip: dict[str, int] = defaultdict(int)
verrou = asyncio.Lock()
ecritures = LimiteurEcritures(par_minute=ECRITURES_PAR_MIN)


def ident(jeton: str) -> str | None:
    if not RE_JETON.match(jeton or ""):
        return None
    return hashlib.sha256(("bdf:" + jeton).encode()).hexdigest()[:16]


# ---------------------------------------------------------------- classement
def base() -> sqlite3.Connection:
    c = sqlite3.connect(BASE, timeout=5)
    c.row_factory = sqlite3.Row
    return c


with base() as _c:
    _c.execute("""create table if not exists classement (
        id text primary key, rp integer, w integer, l integer, dr integer, g integer, peak integer,
        cs text, pend text, t integer)""")
    _c.execute("create index if not exists classement_rp on classement(rp desc)")


def ligne(r: sqlite3.Row) -> dict:
    d = {k: r[k] for k in ("id", "rp", "w", "l", "dr", "g", "peak", "cs", "t")}
    if r["pend"]:
        d["pend"] = json.loads(r["pend"])
    return d


def entier(v, lo, hi):
    if isinstance(v, bool) or not isinstance(v, (int, float)) or v != v:
        raise ValueError
    v = int(round(v))
    if not lo <= v <= hi:
        raise ValueError
    return v


SANS_CONTROLE = re.compile("[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]")


def valider(corps: dict, avant: dict | None) -> dict:
    d = {"rp": entier(corps.get("rp"), 0, 5000), "w": entier(corps.get("w", 0), 0, 10**6),
         "l": entier(corps.get("l", 0), 0, 10**6), "dr": entier(corps.get("dr", 0), 0, 10**6),
         "g": entier(corps.get("g", 0), 0, 10**6), "peak": entier(corps.get("peak", 1000), 0, 5000)}
    cs = corps.get("cs", "")
    if not isinstance(cs, str):
        raise ValueError
    # pseudo : caractères de contrôle retirés, et caractères HTML retirés (défense en profondeur côté serveur)
    d["cs"] = re.sub(r"[<>\"'`&]", "", SANS_CONTROLE.sub("", cs)).strip()[:20]
    p = corps.get("pend")
    if p is None:
        d["pend"] = None
    elif isinstance(p, dict):
        d["pend"] = {"t": entier(p.get("t", 0), 0, 9 * 10**15), "w": entier(p.get("w"), 0, 5000), "d": entier(p.get("d"), 0, 5000)}
    else:
        raise ValueError
    # garde-fous : une écriture ne fait bouger les points que d'une partie à la fois
    ref = avant or {"rp": 1000, "w": 0, "l": 0, "dr": 0, "g": 0, "peak": 1000}
    if abs(d["rp"] - ref["rp"]) > 100 or not ref["g"] <= d["g"] <= ref["g"] + 1:
        raise ValueError
    for k in ("w", "l", "dr"):
        if abs(d[k] - ref[k]) > 1:
            raise ValueError
    d["peak"] = max(d["rp"], min(d["peak"], max(ref["peak"], d["rp"])))
    return d


def jeton_requete(req: Request) -> str | None:
    return ident(req.headers.get("x-jeton", ""))


@app.get("/api/moi")
def moi(req: Request):
    i = jeton_requete(req)
    if not i:
        return JSONResponse({"code": "jeton"}, 400)
    return {"id": i}


@app.get("/api/classement")
def classement(limite: int = 50):
    limite = max(1, min(50, limite))
    with base() as c:
        rs = c.execute("select * from classement order by rp desc, t asc limit ?", (limite,)).fetchall()
    return JSONResponse([ligne(r) for r in rs], headers={"Cache-Control": "no-store"})


@app.get("/api/classement/{i}")
def fiche(i: str):
    # joueur inconnu : 200 + null (pas de 404, qui s'afficherait en erreur dans la console du navigateur)
    r = None
    if RE_ID.match(i):
        with base() as c:
            r = c.execute("select * from classement where id=?", (i,)).fetchone()
    return JSONResponse(ligne(r) if r else None, headers={"Cache-Control": "no-store"})


@app.put("/api/classement/{i}")
async def ecrire(i: str, req: Request):
    if jeton_requete(req) != i or not RE_ID.match(i):
        return JSONResponse({"code": "permission_denied"}, 403)
    now = time.monotonic()
    if not ecritures.autoriser(i, now):
        return JSONResponse({"code": "trop_rapide"}, 429)
    try:
        if int(req.headers.get("content-length") or 0) > CORPS_MAX:
            return JSONResponse({"code": "trop_grand"}, 413)
        brut = b""
        async for morceau in req.stream():   # lecture bornée, même sans en-tête Content-Length
            brut += morceau
            if len(brut) > CORPS_MAX:
                return JSONResponse({"code": "trop_grand"}, 413)
        corps = json.loads(brut or b"{}")
        if not isinstance(corps, dict):
            raise ValueError
        with base() as c:
            r = c.execute("select * from classement where id=?", (i,)).fetchone()
            d = valider(corps, ligne(r) if r else None)
            c.execute("""insert into classement(id,rp,w,l,dr,g,peak,cs,pend,t) values(?,?,?,?,?,?,?,?,?,?)
                on conflict(id) do update set rp=excluded.rp,w=excluded.w,l=excluded.l,dr=excluded.dr,g=excluded.g,
                peak=excluded.peak,cs=excluded.cs,pend=excluded.pend,t=excluded.t""",
                      (i, d["rp"], d["w"], d["l"], d["dr"], d["g"], d["peak"], d["cs"],
                       json.dumps(d["pend"]) if d["pend"] else None, int(time.time() * 1000)))
    except (ValueError, TypeError):
        return JSONResponse({"code": "invalid_argument"}, 400)
    return {"ok": True}


# ---------------------------------------------------------------- pages
@app.get("/healthz")
def healthz():
    return PlainTextResponse("ok")


@app.get("/")
def accueil_page():
    return FileResponse(f"{STATIQUE}/index.html", headers={"Cache-Control": "no-cache"})


# ---------------------------------------------------------------- relais
async def envoyer(ws: WebSocket, obj) -> None:
    try:
        await ws.send_text(json.dumps(obj, separators=(",", ":")))
    except Exception:
        pass


async def diffuser(salon: str, obj, sauf: str | None = None) -> None:
    membres = [m["ws"] for p, m in list(salons.get(salon, {}).items()) if p != sauf]
    texte = json.dumps(obj, separators=(",", ":"))
    for w in membres:
        try:
            await w.send_text(texte)
        except Exception:
            pass


def ip_client(ws: WebSocket) -> str:
    # Adresse du joueur. Derrière un proxy, Uvicorn la remplace par celle de X-Forwarded-For UNIQUEMENT si le
    # proxy figure dans FORWARDED_ALLOW_IPS : un joueur ne peut donc pas usurper une autre adresse.
    return ws.client.host if ws.client else "?"


def presence_valide(d) -> dict | None:
    if not isinstance(d, dict) or len(d) > 10:
        return None
    if len(json.dumps(d)) > PRESENCE_MAX:
        return None
    for k, v in d.items():
        if not isinstance(k, str) or not isinstance(v, (int, float, str, bool)) or (isinstance(v, str) and len(v) > 40):
            return None
    return d


@app.websocket("/ws")
async def relais(ws: WebSocket):
    salon = ws.query_params.get("salon", "")
    par = ident(ws.query_params.get("jeton", ""))
    ip = ip_client(ws)
    await ws.accept()
    est_accueil = salon == ACCUEIL
    if not (est_accueil or NOM_SALON.match(salon)) or not par:
        await envoyer(ws, {"t": "erreur", "code": "nom de partie invalide"}); await ws.close(1008); return
    async with verrou:
        refus = None
        if par_ip[ip] >= CONNEXIONS_PAR_IP:
            refus = "trop de connexions"
        elif not est_accueil and salon not in salons and len([s for s in salons if s != ACCUEIL]) >= SALONS_MAX:
            refus = "serveur plein"
        elif len(salons.get(salon, {})) >= (ACCUEIL_MAX if est_accueil else JOUEURS_PAR_SALON):
            refus = "partie pleine"
        if refus is None:
            moi_id = secrets.token_hex(6)
            membres = salons.setdefault(salon, {})
            autres = [{"p": p, "by": m["by"], "pr": m["pr"]} for p, m in membres.items()]
            membres[moi_id] = {"ws": ws, "by": par, "pr": None}
            par_ip[ip] += 1
    if refus:
        await envoyer(ws, {"t": "erreur", "code": refus}); await ws.close(1008); return

    await envoyer(ws, {"t": "bienvenue", "moi": moi_id, "by": par, "pairs": autres})
    await diffuser(salon, {"t": "pairs", "arrives": [{"p": moi_id, "by": par, "pr": None}], "partis": []}, sauf=moi_id)
    jetons, dernier = float(RAFALE), time.monotonic()
    try:
        while True:
            try:
                texte = await asyncio.wait_for(ws.receive_text(), timeout=INACTIVITE)
            except asyncio.TimeoutError:
                if est_accueil:
                    continue   # l'accueil reste ouvert tant que la page l'est
                raise
            maintenant = time.monotonic()
            jetons = min(RAFALE, jetons + (maintenant - dernier) * DEBIT); dernier = maintenant
            if jetons < 1:
                continue  # trop rapide : message ignoré
            jetons -= 1
            if len(texte) > TAILLE_MAX:
                continue
            try:
                m = json.loads(texte)
            except ValueError:
                continue
            if not isinstance(m, dict):
                continue
            if m.get("t") == "presence":
                pr = presence_valide(m.get("d"))
                if pr is None or not est_accueil:
                    continue
                salons[salon][moi_id]["pr"] = pr
                await diffuser(salon, {"t": "pairs", "arrives": [], "partis": [], "maj": [{"p": moi_id, "pr": pr}]}, sauf=moi_id)
                continue
            if est_accueil:
                continue   # pas de messages dans l'accueil
            sujet = m.get("s")
            if not isinstance(sujet, str) or not 0 < len(sujet) <= 20:
                continue
            await diffuser(salon, {"t": "msg", "p": moi_id, "by": par, "s": sujet, "d": m.get("d")}, sauf=moi_id)
    except (WebSocketDisconnect, asyncio.TimeoutError, RuntimeError):
        pass
    finally:
        async with verrou:
            membres = salons.get(salon, {})
            membres.pop(moi_id, None)
            if not membres:
                salons.pop(salon, None)
            par_ip[ip] -= 1
            if par_ip[ip] <= 0:
                par_ip.pop(ip, None)
        await diffuser(salon, {"t": "pairs", "arrives": [], "partis": [moi_id]})
        try:
            await ws.close()
        except Exception:
            pass
