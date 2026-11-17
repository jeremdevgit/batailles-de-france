<p align="center"><img src="app/static/icone.svg" width="112" alt=""></p>

<h1 align="center">Batailles de France</h1>

<p align="center"><b>Echtzeitstrategie im Browser auf den Karten von Lyon, Paris, Marseille, Bordeaux und Straßburg.</b></p>

<p align="center"><img src="https://img.shields.io/badge/%F0%9F%8E%AE%20Music%20%26%20games-Browser-c2410c?style=flat-square" alt="Musik & Spiele"> <a href="https://github.com/jeremdevgit/batailles-de-france/releases"><img src="https://img.shields.io/github/v/release/jeremdevgit/batailles-de-france?include_prereleases&style=flat-square&label=version" alt="version"></a> <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0--or--later-555?style=flat-square" alt="GPL-3.0-or-later"></a></p>

<p align="center"><a href="README.md">English</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <b>Deutsch</b> · <a href="README.it.md">Italiano</a> · <a href="README.pt.md">Português</a> · <a href="README.zh.md">简体中文</a> · <a href="README.ja.md">日本語</a></p>

<p align="center"><a href="https://github.com/jeremdevgit/batailles-de-france/releases/latest"><b>⬇ Herunterladen</b></a></p>

![Eine Partie in Lyon](captures/en/partie-pc.png)

Erobere das feindliche Hauptquartier auf den **echten Karten von Lyon, Paris, Marseille, Bordeaux und Straßburg**: Brücken, Ufer, Hügel, Viertel, Gebäude, Forschung, Fähigkeiten, politische Entscheidungen und stadttypische Überraschungen.

## Auf einen Blick

| | |
|---|---|
| **Kategorie** | 🎮 Musik & Spiele |
| **Plattformen** | Browser |
| **Oberfläche** | 8 Sprachen (EN, FR, ES, DE, IT, PT, ZH, JA) |
| **Preis** | Kostenlos, quelloffen, ohne Werbung und Telemetrie |
| **Status** | Stabil |
| **Lizenz** | [GPL-3.0-or-later](LICENSE) |

## Spielmodi

- **Solo** gegen die KI, allein oder 2 gegen 2 mit einer verbündeten KI; deine Karriere wächst mit jeder Partie.
- **Zwei Spieler** am selben Computer, abwechselnd.
- **Online** mit Freunden, 1 gegen 1 oder 2 gegen 2, mit einem 5-stelligen Spielcode – jeder liest die Meldungen in seiner Sprache.
- **Gewertet**: automatische Gegnersuche, Ränge vom Rekruten bis zum Marschall, Rangliste.
- **Simulation**: Schau zwei KIs beim Kämpfen zu.
- **Karteneditor**, um eigene Schlachtfelder zu bauen und zu teilen.

<p><img src="captures/en/accueil-pc.png" alt="Wahl von Karte und Modus" width="62%"> <img src="captures/en/accueil-telephone.png" alt="Auf dem Smartphone" width="18%"></p>

## So wird gespielt

**Sofort und offline** – lade `Batailles-de-France-hors-ligne.html` aus der [neuesten Version](https://github.com/jeremdevgit/batailles-de-france/releases/latest) und öffne es in einem beliebigen Browser. Solo, zwei Spieler, Simulation und Karteneditor funktionieren ohne Verbindung. Prüfen: `shasum -a 256 -c SHA256SUMS.txt --ignore-missing` oder `Get-FileHash`.

**Online und gewertet** brauchen den Spielserver.

## Server betreiben

Der FastAPI-Server (`app/main.py`) liefert das Spiel aus, leitet Online-Nachrichten per WebSocket weiter und führt die Rangliste in SQLite. Der Browser des Gastgebers simuliert die Partie.

```sh
docker compose up -d --build     # lauscht auf 127.0.0.1:8000
```

Davor gehört ein **HTTPS-Reverse-Proxy, der WebSockets weiterleitet** (Caddy: `reverse_proxy 127.0.0.1:8000`; nginx: `proxy_http_version 1.1` plus `Upgrade`/`Connection`-Header).

| Variable | Zweck | Standard |
|---|---|---|
| `FORWARDED_ALLOW_IPS` | Proxy, der die echte IP der Spieler weitergeben darf. **Nie `*`**, wenn der Port direkt erreichbar ist | `172.16.0.0/12` (Docker) |
| `BDF_DONNEES` | Ordner der Ranglisten-Datenbank | `/donnees` |
| `BDF_STATIQUE` | Ordner der Spieldateien | `/app/static` |

Ohne Docker: `pip install -r requirements.txt`, dann in `app/` `uvicorn main:app --host 127.0.0.1 --port 8000 --proxy-headers --no-server-header` mit gesetztem `BDF_STATIQUE` und `BDF_DONNEES`.

## Datenschutz und Fairness

- **Kein Konto, keine persönlichen Daten**: ein zufälliges Token pro Browser; in der Rangliste erscheint nur ein Hash.
- Serverseitige Grenzen für Nachrichtengröße und -rate, Verbindungen, Partien, Spieler und Ranglisteneinträge; parametrisiertes SQL; strenge CSP und Sicherheits-Header; Texte anderer Spieler werden entschärft.
- Gehärtetes Docker-Image (ohne Privilegien, schreibgeschützt, ohne Capabilities), mitgelieferte Schriften.
- Bewusst vertraut die Rangliste den von Browsern gemeldeten Ergebnissen (auf Plausibilität geprüft), und online ist der Gastgeber maßgeblich.

## Selbst bauen

```sh
python3 construire.py     # Python 3.8+, ohne Abhängigkeiten → dist/Batailles-de-France-hors-ligne.html + SHA256SUMS.txt
```

Die Übersetzungen liegen in `app/static/textes/`, eine Datei pro Sprache, mit dem französischen Text als Schlüssel.

## Lizenz

GNU GPL v3 oder später – siehe [LICENSE](LICENSE). Mitgelieferte Schriften [Barlow](https://github.com/jpt/barlow) und [Saira Condensed](https://github.com/Omnibus-Type/Saira) (OFL 1.1, [`licences-tiers/`](licences-tiers/)).

---

Eine Sicherheitslücke gefunden? Bitte privat melden (siehe [SECURITY.md](SECURITY.md)), nicht in einem öffentlichen Issue.

## Weitere freie Software von jeremdevgit

Alle kostenlos, quelloffen und werbefrei.

**🛠️ System & Hardware** — [Boîte à outils](https://github.com/jeremdevgit/boite-a-outils) · [rJb](https://github.com/jeremdevgit/rjb) · [LJ Hub](https://github.com/jeremdevgit/lj-hub) · [Decklight](https://github.com/jeremdevgit/decklight)

**📒 Produktivität & Daten** — [Carnet de notes](https://github.com/jeremdevgit/carnet-rust) · [JMeca](https://github.com/jeremdevgit/jmeca) · [Suite Libre](https://jeremdevgit.github.io/suite-libre/)

**🎮 Musik & Spiele** — [Pomme](https://github.com/jeremdevgit/pomme) · [Ludothèque](https://github.com/jeremdevgit/ludotheque) · [AutoDex](https://github.com/jeremdevgit/autodex)
