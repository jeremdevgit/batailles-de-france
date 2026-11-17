<p align="center"><img src="app/static/icone.svg" width="112" alt=""></p>

<h1 align="center">Batailles de France</h1>

<p align="center"><b>Estrategia en tiempo real en el navegador sobre los mapas de Lyon, París, Marsella, Burdeos y Estrasburgo.</b></p>

<p align="center"><img src="https://img.shields.io/badge/%F0%9F%8E%AE%20Music%20%26%20games-Browser-c2410c?style=flat-square" alt="Música y juegos"> <a href="https://github.com/jeremdevgit/batailles-de-france/releases"><img src="https://img.shields.io/github/v/release/jeremdevgit/batailles-de-france?include_prereleases&style=flat-square&label=version" alt="version"></a> <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0--or--later-555?style=flat-square" alt="GPL-3.0-or-later"></a></p>

<p align="center"><a href="README.md">English</a> · <a href="README.fr.md">Français</a> · <b>Español</b> · <a href="README.de.md">Deutsch</a> · <a href="README.it.md">Italiano</a> · <a href="README.pt.md">Português</a> · <a href="README.zh.md">简体中文</a> · <a href="README.ja.md">日本語</a></p>

<p align="center"><a href="https://github.com/jeremdevgit/batailles-de-france/releases/latest"><b>⬇ Descargar</b></a></p>

![Una partida en Lyon](captures/en/partie-pc.png)

Conquista el cuartel general enemigo en los **mapas reales de Lyon, París, Marsella, Burdeos y Estrasburgo**: puentes, orillas, colinas, barrios, edificios, investigación, habilidades, decisiones políticas y sorpresas propias de cada ciudad.

## De un vistazo

| | |
|---|---|
| **Categoría** | 🎮 Música y juegos |
| **Plataformas** | Navegador |
| **Interfaz** | 8 idiomas (EN, FR, ES, DE, IT, PT, ZH, JA) |
| **Precio** | Gratis, de código abierto, sin anuncios ni telemetría |
| **Estado** | Estable |
| **Licencia** | [GPL-3.0-or-later](LICENSE) |

## Modos de juego

- **Solo** contra la IA, en solitario o 2 contra 2 con una IA aliada; tu carrera avanza en cada partida.
- **Dos jugadores** en el mismo ordenador, por turnos.
- **En línea** con amigos, 1 contra 1 o 2 contra 2, con un código de partida de 5 caracteres; cada jugador lee los mensajes en su idioma.
- **Clasificatoria**: emparejamiento automático, rangos de Recluta a Mariscal, clasificación.
- **Simulación**: mira cómo luchan dos IA.
- **Editor de mapas** para crear y compartir tus propios campos de batalla.

<p><img src="captures/en/accueil-pc.png" alt="Elección del mapa y del modo" width="62%"> <img src="captures/en/accueil-telephone.png" alt="En el móvil" width="18%"></p>

## Cómo jugar

**Ya mismo, sin conexión**: descarga `Batailles-de-France-hors-ligne.html` de la [última versión](https://github.com/jeremdevgit/batailles-de-france/releases/latest) y ábrelo en cualquier navegador. Solo, dos jugadores, simulación y editor de mapas funcionan sin conexión. Comprobación: `shasum -a 256 -c SHA256SUMS.txt --ignore-missing` o `Get-FileHash`.

**En línea y clasificatoria** necesitan el servidor de juego.

## Alojar el servidor

El servidor FastAPI (`app/main.py`) sirve el juego, retransmite los mensajes en línea por WebSocket y guarda la clasificación en SQLite. El navegador del anfitrión simula la partida.

```sh
docker compose up -d --build     # escucha en 127.0.0.1:8000
```

Pon delante un **proxy inverso HTTPS que reenvíe WebSockets** (Caddy: `reverse_proxy 127.0.0.1:8000`; nginx: `proxy_http_version 1.1` y las cabeceras `Upgrade`/`Connection`).

| Variable | Función | Por defecto |
|---|---|---|
| `FORWARDED_ALLOW_IPS` | Proxy autorizado a transmitir la IP real de los jugadores. **Nunca `*`** si el puerto es accesible directamente | `172.16.0.0/12` (Docker) |
| `BDF_DONNEES` | Carpeta de la base de la clasificación | `/donnees` |
| `BDF_STATIQUE` | Carpeta de los archivos del juego | `/app/static` |

Sin Docker: `pip install -r requirements.txt` y, desde `app/`, `uvicorn main:app --host 127.0.0.1 --port 8000 --proxy-headers --no-server-header` con `BDF_STATIQUE` y `BDF_DONNEES` definidas.

## Privacidad y juego limpio

- **Sin cuenta ni datos personales**: un token aleatorio por navegador; en la clasificación solo aparece un hash.
- Límites en el servidor para tamaño y ritmo de mensajes, conexiones, partidas, jugadores y escrituras en la clasificación; SQL parametrizado; CSP estricta y cabeceras de seguridad; el texto de otros jugadores se neutraliza.
- Imagen Docker reforzada (sin privilegios, solo lectura, sin capacidades), fuentes incluidas.
- Por diseño, la clasificación confía en los resultados enviados por los navegadores (comprobados por verosimilitud) y el anfitrión manda en las partidas en línea.

## Compilar

```sh
python3 construire.py     # Python 3.8+, sin dependencias → dist/Batailles-de-France-hors-ligne.html + SHA256SUMS.txt
```

Las traducciones están en `app/static/textes/`, un archivo por idioma, con el texto francés como clave.

## Licencia

GNU GPL v3 o posterior — ver [LICENSE](LICENSE). Fuentes incluidas [Barlow](https://github.com/jpt/barlow) y [Saira Condensed](https://github.com/Omnibus-Type/Saira) (OFL 1.1, [`licences-tiers/`](licences-tiers/)).

---

¿Has encontrado una vulnerabilidad? Infórmala en privado (consulta [SECURITY.md](SECURITY.md)) y no en una incidencia pública.

## Más software libre de jeremdevgit

Todos gratuitos, de código abierto y sin anuncios.

**🛠️ Sistema y hardware** — [Boîte à outils](https://github.com/jeremdevgit/boite-a-outils) · [rJb](https://github.com/jeremdevgit/rjb) · [LJ Hub](https://github.com/jeremdevgit/lj-hub) · [Decklight](https://github.com/jeremdevgit/decklight)

**📒 Productividad y datos** — [Carnet de notes](https://github.com/jeremdevgit/carnet-rust) · [JMeca](https://github.com/jeremdevgit/jmeca) · [Suite Libre](https://jeremdevgit.github.io/suite-libre/)

**🎮 Música y juegos** — [Pomme](https://github.com/jeremdevgit/pomme) · [Ludothèque](https://github.com/jeremdevgit/ludotheque) · [AutoDex](https://github.com/jeremdevgit/autodex)
