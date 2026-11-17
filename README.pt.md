<p align="center"><img src="app/static/icone.svg" width="112" alt=""></p>

<h1 align="center">Batailles de France</h1>

<p align="center"><b>Estratégia em tempo real no navegador nos mapas de Lyon, Paris, Marselha, Bordéus e Estrasburgo.</b></p>

<p align="center"><img src="https://img.shields.io/badge/%F0%9F%8E%AE%20Music%20%26%20games-Browser-c2410c?style=flat-square" alt="Música e jogos"> <a href="https://github.com/jeremdevgit/batailles-de-france/releases"><img src="https://img.shields.io/github/v/release/jeremdevgit/batailles-de-france?include_prereleases&style=flat-square&label=version" alt="version"></a> <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0--or--later-555?style=flat-square" alt="GPL-3.0-or-later"></a></p>

<p align="center"><a href="README.md">English</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.de.md">Deutsch</a> · <a href="README.it.md">Italiano</a> · <b>Português</b> · <a href="README.zh.md">简体中文</a> · <a href="README.ja.md">日本語</a></p>

<p align="center"><a href="https://github.com/jeremdevgit/batailles-de-france/releases/latest"><b>⬇ Transferir</b></a></p>

![Uma partida em Lyon](captures/en/partie-pc.png)

Conquiste o quartel-general inimigo nos **mapas reais de Lyon, Paris, Marselha, Bordéus e Estrasburgo**: pontes, margens, colinas, bairros, edifícios, investigação, habilidades, decisões políticas e surpresas próprias de cada cidade.

## Em resumo

| | |
|---|---|
| **Categoria** | 🎮 Música e jogos |
| **Plataformas** | Navegador |
| **Interface** | 8 idiomas (EN, FR, ES, DE, IT, PT, ZH, JA) |
| **Preço** | Gratuito, de código aberto, sem anúncios nem telemetria |
| **Estado** | Estável |
| **Licença** | [GPL-3.0-or-later](LICENSE) |

## Modos de jogo

- **A solo** contra a IA, sozinho ou 2 contra 2 com uma IA aliada; a sua carreira avança a cada partida.
- **Dois jogadores** no mesmo computador, à vez.
- **Online** com amigos, 1 contra 1 ou 2 contra 2, com um código de partida de 5 caracteres — cada um lê as mensagens no seu idioma.
- **Classificado**: emparelhamento automático, patentes de Recruta a Marechal, classificação.
- **Simulação**: veja duas IA a lutar.
- **Editor de mapas** para criar e partilhar os seus próprios campos de batalha.

<p><img src="captures/en/accueil-pc.png" alt="Escolha do mapa e do modo" width="62%"> <img src="captures/en/accueil-telephone.png" alt="No telemóvel" width="18%"></p>

## Como jogar

**Já, sem ligação** — transfira `Batailles-de-France-hors-ligne.html` da [versão mais recente](https://github.com/jeremdevgit/batailles-de-france/releases/latest) e abra-o em qualquer navegador. Solo, dois jogadores, simulação e editor de mapas funcionam offline. Verificação: `shasum -a 256 -c SHA256SUMS.txt --ignore-missing` ou `Get-FileHash`.

**Online e classificado** precisam do servidor de jogo.

## Alojar o servidor

O servidor FastAPI (`app/main.py`) serve o jogo, retransmite as mensagens online por WebSocket e guarda a classificação em SQLite. É o navegador do anfitrião que simula a partida.

```sh
docker compose up -d --build     # escuta em 127.0.0.1:8000
```

Coloque à frente um **proxy inverso HTTPS que encaminhe WebSockets** (Caddy: `reverse_proxy 127.0.0.1:8000`; nginx: `proxy_http_version 1.1` e os cabeçalhos `Upgrade`/`Connection`).

| Variável | Função | Por omissão |
|---|---|---|
| `FORWARDED_ALLOW_IPS` | Proxy autorizado a transmitir o IP real dos jogadores. **Nunca `*`** se a porta for acessível diretamente | `172.16.0.0/12` (Docker) |
| `BDF_DONNEES` | Pasta da base de dados da classificação | `/donnees` |
| `BDF_STATIQUE` | Pasta dos ficheiros do jogo | `/app/static` |

Sem Docker: `pip install -r requirements.txt` e, a partir de `app/`, `uvicorn main:app --host 127.0.0.1 --port 8000 --proxy-headers --no-server-header` com `BDF_STATIQUE` e `BDF_DONNEES` definidas.

## Privacidade e jogo limpo

- **Sem conta nem dados pessoais**: um token aleatório por navegador; na classificação só aparece um hash.
- Limites no servidor para tamanho e ritmo das mensagens, ligações, partidas, jogadores e escritas na classificação; SQL parametrizado; CSP estrita e cabeçalhos de segurança; o texto dos outros jogadores é neutralizado.
- Imagem Docker reforçada (sem privilégios, só de leitura, sem capacidades), tipos de letra incluídos.
- Por conceção, a classificação confia nos resultados enviados pelos navegadores (verificados quanto à plausibilidade) e o anfitrião prevalece nas partidas online.

## Compilar

```sh
python3 construire.py     # Python 3.8+, sem dependências → dist/Batailles-de-France-hors-ligne.html + SHA256SUMS.txt
```

As traduções estão em `app/static/textes/`, um ficheiro por idioma, com o texto francês como chave.

## Licença

GNU GPL v3 ou posterior — ver [LICENSE](LICENSE). Tipos de letra incluídos [Barlow](https://github.com/jpt/barlow) e [Saira Condensed](https://github.com/Omnibus-Type/Saira) (OFL 1.1, [`licences-tiers/`](licences-tiers/)).

---

Encontrou uma vulnerabilidade? Comunique-a em privado (consulte [SECURITY.md](SECURITY.md)) e não num issue público.

## Mais software livre de jeremdevgit

Todos gratuitos, de código aberto e sem anúncios.

**🛠️ Sistema e hardware** — [Boîte à outils](https://github.com/jeremdevgit/boite-a-outils) · [rJb](https://github.com/jeremdevgit/rjb) · [LJ Hub](https://github.com/jeremdevgit/lj-hub) · [Decklight](https://github.com/jeremdevgit/decklight)

**📒 Produtividade e dados** — [Carnet de notes](https://github.com/jeremdevgit/carnet-rust) · [JMeca](https://github.com/jeremdevgit/jmeca) · [Suite Libre](https://jeremdevgit.github.io/suite-libre/)

**🎮 Música e jogos** — [Pomme](https://github.com/jeremdevgit/pomme) · [Ludothèque](https://github.com/jeremdevgit/ludotheque) · [AutoDex](https://github.com/jeremdevgit/autodex)
