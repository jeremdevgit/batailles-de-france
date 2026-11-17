<p align="center"><img src="app/static/icone.svg" width="112" alt=""></p>

<h1 align="center">Batailles de France</h1>

<p align="center"><b>浏览器即时战略游戏，地图取自里昂、巴黎、马赛、波尔多和斯特拉斯堡。</b></p>

<p align="center"><img src="https://img.shields.io/badge/%F0%9F%8E%AE%20Music%20%26%20games-Browser-c2410c?style=flat-square" alt="音乐与游戏"> <a href="https://github.com/jeremdevgit/batailles-de-france/releases"><img src="https://img.shields.io/github/v/release/jeremdevgit/batailles-de-france?include_prereleases&style=flat-square&label=version" alt="version"></a> <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0--or--later-555?style=flat-square" alt="GPL-3.0-or-later"></a></p>

<p align="center"><a href="README.md">English</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.de.md">Deutsch</a> · <a href="README.it.md">Italiano</a> · <a href="README.pt.md">Português</a> · <b>简体中文</b> · <a href="README.ja.md">日本語</a></p>

<p align="center"><a href="https://github.com/jeremdevgit/batailles-de-france/releases/latest"><b>⬇ 下载</b></a></p>

![里昂的一局对战](captures/en/partie-pc.png)

在**里昂、巴黎、马赛、波尔多和斯特拉斯堡的真实地图**上攻占敌方总部：桥梁、河岸、山丘、街区、建筑、科研、技能、政治决策，以及每座城市独有的惊喜。

## 概览

| | |
|---|---|
| **类别** | 🎮 音乐与游戏 |
| **平台** | 浏览器 |
| **界面语言** | 8 种语言（英、法、西、德、意、葡、中、日） |
| **价格** | 免费、开源、无广告、无遥测 |
| **状态** | 稳定版 |
| **许可证** | [GPL-3.0-or-later](LICENSE) |

## 游戏模式

- **单人**对战 AI，可独自作战，也可与 AI 盟友 2 对 2；每局都会推进你的生涯。
- **双人**同屏，轮流下达指令。
- **在线**与好友 1 对 1 或 2 对 2，使用 5 位对局码——每位玩家都以自己的语言阅读消息。
- **排位**：自动匹配，军衔从新兵到元帅，排行榜。
- **模拟**：观看两个 AI 对战。
- **地图编辑器**：创建并分享你自己的战场。

<p><img src="captures/en/accueil-pc.png" alt="选择地图和模式" width="62%"> <img src="captures/en/accueil-telephone.png" alt="手机上" width="18%"></p>

## 如何开始

**立即离线游玩**：从[最新版本](https://github.com/jeremdevgit/batailles-de-france/releases/latest)下载 `Batailles-de-France-hors-ligne.html`，在任意浏览器中打开即可。单人、双人、模拟和地图编辑器均无需联网。校验：`shasum -a 256 -c SHA256SUMS.txt --ignore-missing` 或 `Get-FileHash`。

**在线和排位**需要下面的游戏服务器。

## 架设服务器

FastAPI 服务器（`app/main.py`）提供游戏文件，通过 WebSocket 转发在线消息，并用 SQLite 保存排行榜。对局由房主的浏览器进行模拟。

```sh
docker compose up -d --build     # 监听 127.0.0.1:8000
```

请在前面放置一个**支持 WebSocket 转发的 HTTPS 反向代理**（Caddy：`reverse_proxy 127.0.0.1:8000`；nginx：`proxy_http_version 1.1` 以及 `Upgrade`/`Connection` 头）。

| 变量 | 作用 | 默认值 |
|---|---|---|
| `FORWARDED_ALLOW_IPS` | 允许传递玩家真实 IP 的代理。若端口可被直接访问，**绝不要设为 `*`** | `172.16.0.0/12`（Docker） |
| `BDF_DONNEES` | 排行榜数据库目录 | `/donnees` |
| `BDF_STATIQUE` | 游戏文件目录 | `/app/static` |

不用 Docker：`pip install -r requirements.txt`，然后在 `app/` 中设置 `BDF_STATIQUE` 和 `BDF_DONNEES` 并运行 `uvicorn main:app --host 127.0.0.1 --port 8000 --proxy-headers --no-server-header`。

## 隐私与公平

- **无账号、无个人数据**：每个浏览器一个随机令牌；排行榜上只显示其哈希。
- 服务器限制消息大小与频率、连接数、对局数、每局玩家数和排行榜写入；参数化 SQL；严格 CSP 和安全响应头；其他玩家的文本会被转义处理。
- 加固的 Docker 镜像（非特权用户、只读文件系统、无 capabilities），字体内置。
- 按设计，排行榜信任浏览器上报的结果（会做合理性检查），在线对局以房主为准。

## 从源码构建

```sh
python3 construire.py     # Python 3.8+，无依赖 → dist/Batailles-de-France-hors-ligne.html + SHA256SUMS.txt
```

翻译位于 `app/static/textes/`，每种语言一个文件，以法语文本为键。

## 许可证

GNU GPL v3 或更高版本，见 [LICENSE](LICENSE)。内置字体 [Barlow](https://github.com/jpt/barlow) 和 [Saira Condensed](https://github.com/Omnibus-Type/Saira)（OFL 1.1，[`licences-tiers/`](licences-tiers/)）。

---

发现安全漏洞？请私下报告（见 [SECURITY.md](SECURITY.md)），不要发公开 issue。

## jeremdevgit 的其他自由软件

全部免费、开源、无广告。

**🛠️ 系统与硬件** — [Boîte à outils](https://github.com/jeremdevgit/boite-a-outils) · [rJb](https://github.com/jeremdevgit/rjb) · [LJ Hub](https://github.com/jeremdevgit/lj-hub) · [Decklight](https://github.com/jeremdevgit/decklight)

**📒 效率与数据** — [Carnet de notes](https://github.com/jeremdevgit/carnet-rust) · [JMeca](https://github.com/jeremdevgit/jmeca) · [Suite Libre](https://jeremdevgit.github.io/suite-libre/)

**🎮 音乐与游戏** — [Pomme](https://github.com/jeremdevgit/pomme) · [Ludothèque](https://github.com/jeremdevgit/ludotheque) · [AutoDex](https://github.com/jeremdevgit/autodex)
