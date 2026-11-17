<p align="center"><img src="app/static/icone.svg" width="112" alt=""></p>

<h1 align="center">Batailles de France</h1>

<p align="center"><b>リヨン、パリ、マルセイユ、ボルドー、ストラスブールの地図で遊ぶブラウザー版リアルタイムストラテジー。</b></p>

<p align="center"><img src="https://img.shields.io/badge/%F0%9F%8E%AE%20Music%20%26%20games-Browser-c2410c?style=flat-square" alt="音楽とゲーム"> <a href="https://github.com/jeremdevgit/batailles-de-france/releases"><img src="https://img.shields.io/github/v/release/jeremdevgit/batailles-de-france?include_prereleases&style=flat-square&label=version" alt="version"></a> <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0--or--later-555?style=flat-square" alt="GPL-3.0-or-later"></a></p>

<p align="center"><a href="README.md">English</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.de.md">Deutsch</a> · <a href="README.it.md">Italiano</a> · <a href="README.pt.md">Português</a> · <a href="README.zh.md">简体中文</a> · <b>日本語</b></p>

<p align="center"><a href="https://github.com/jeremdevgit/batailles-de-france/releases/latest"><b>⬇ ダウンロード</b></a></p>

![リヨンでの対戦](captures/en/partie-pc.png)

**リヨン、パリ、マルセイユ、ボルドー、ストラスブールの実際の地図**で敵の司令部を奪い取りましょう：橋、河岸、丘、街区、建物、研究、スキル、政治的な決断、そして各都市ならではのサプライズ。

## 概要

| | |
|---|---|
| **カテゴリー** | 🎮 音楽とゲーム |
| **対応環境** | ブラウザー |
| **表示言語** | 8 言語（英・仏・西・独・伊・葡・中・日） |
| **価格** | 無料・オープンソース・広告なし・テレメトリーなし |
| **ステータス** | 安定版 |
| **ライセンス** | [GPL-3.0-or-later](LICENSE) |

## ゲームモード

- **ソロ**：AI と対戦。単独でも、味方 AI と 2 対 2 でも。対戦ごとにキャリアが進みます。
- **2 人プレイ**：同じパソコンで交互に指示を出します。
- **オンライン**：5 文字の対戦コードで友達と 1 対 1 または 2 対 2。メッセージは各プレイヤーの言語で表示されます。
- **ランクマッチ**：自動マッチング、新兵から元帥までの階級、ランキング。
- **シミュレーション**：2 つの AI の戦いを観戦。
- **マップエディター**：自分だけの戦場を作って共有。

<p><img src="captures/en/accueil-pc.png" alt="マップとモードの選択" width="62%"> <img src="captures/en/accueil-telephone.png" alt="スマホ" width="18%"></p>

## 遊び方

**今すぐオフラインで**：[最新リリース](https://github.com/jeremdevgit/batailles-de-france/releases/latest)から `Batailles-de-France-hors-ligne.html` をダウンロードし、お好きなブラウザーで開くだけ。ソロ、2 人プレイ、シミュレーション、マップエディターは接続なしで遊べます。確認：`shasum -a 256 -c SHA256SUMS.txt --ignore-missing` または `Get-FileHash`。

**オンラインとランクマッチ**には下記のゲームサーバーが必要です。

## サーバーを立てる

FastAPI サーバー（`app/main.py`）はゲームを配信し、オンラインのメッセージを WebSocket で中継し、ランキングを SQLite に保存します。対戦のシミュレーションはホストのブラウザーが行います。

```sh
docker compose up -d --build     # 127.0.0.1:8000 で待ち受け
```

前段には **WebSocket を転送できる HTTPS リバースプロキシ**を置いてください（Caddy：`reverse_proxy 127.0.0.1:8000`、nginx：`proxy_http_version 1.1` と `Upgrade`/`Connection` ヘッダー）。

| 変数 | 用途 | 既定値 |
|---|---|---|
| `FORWARDED_ALLOW_IPS` | プレイヤーの実 IP を渡してよいプロキシ。ポートに直接届く場合は**絶対に `*` にしない** | `172.16.0.0/12`（Docker） |
| `BDF_DONNEES` | ランキングのデータベースフォルダー | `/donnees` |
| `BDF_STATIQUE` | ゲームファイルのフォルダー | `/app/static` |

Docker なしの場合：`pip install -r requirements.txt` のあと、`app/` で `BDF_STATIQUE` と `BDF_DONNEES` を設定して `uvicorn main:app --host 127.0.0.1 --port 8000 --proxy-headers --no-server-header` を実行します。

## プライバシーとフェアプレー

- **アカウントも個人データもなし**：ブラウザーごとにランダムなトークンを発行し、ランキングにはそのハッシュだけが表示されます。
- サーバー側でメッセージのサイズと頻度、接続数、対戦数、プレイヤー数、ランキングへの書き込みを制限。パラメーター化された SQL、厳格な CSP とセキュリティヘッダー。他のプレイヤーのテキストは無害化されます。
- 堅牢化した Docker イメージ（非特権ユーザー、読み取り専用、capabilities なし）、フォント同梱。
- 設計上、ランキングはブラウザーが報告する結果（妥当性チェックあり）を信頼し、オンライン対戦ではホストが正となります。

## ソースからビルド

```sh
python3 construire.py     # Python 3.8+、依存なし → dist/Batailles-de-France-hors-ligne.html + SHA256SUMS.txt
```

翻訳は `app/static/textes/` に言語ごとに 1 ファイルあり、フランス語の文をキーにしています。

## ライセンス

GNU GPL v3 以降 — [LICENSE](LICENSE) を参照。同梱フォント [Barlow](https://github.com/jpt/barlow) と [Saira Condensed](https://github.com/Omnibus-Type/Saira)（OFL 1.1、[`licences-tiers/`](licences-tiers/)）。

---

脆弱性を見つけたら、公開 Issue ではなく非公開で報告してください（[SECURITY.md](SECURITY.md) を参照）。

## jeremdevgit のその他のフリーソフトウェア

すべて無料・オープンソース・広告なし。

**🛠️ システムとハードウェア** — [Boîte à outils](https://github.com/jeremdevgit/boite-a-outils) · [rJb](https://github.com/jeremdevgit/rjb) · [LJ Hub](https://github.com/jeremdevgit/lj-hub) · [Decklight](https://github.com/jeremdevgit/decklight)

**📒 生産性とデータ** — [Carnet de notes](https://github.com/jeremdevgit/carnet-rust) · [JMeca](https://github.com/jeremdevgit/jmeca) · [Suite Libre](https://jeremdevgit.github.io/suite-libre/)

**🎮 音楽とゲーム** — [Pomme](https://github.com/jeremdevgit/pomme) · [Ludothèque](https://github.com/jeremdevgit/ludotheque) · [AutoDex](https://github.com/jeremdevgit/autodex)
