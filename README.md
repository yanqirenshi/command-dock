# command-dock

下部中央に並ぶ円形トリガーと、その上に出るポップオーバーを提供する、フレームワーク非依存の
Web Component(カスタム要素 `<command-dock>`)。開閉(単一オープン)・外クリックで閉じる・項目
選択で自動クローズ、の挙動を内蔵する。中身は `items` プロパティで宣言的に注入する。

vanilla / React / Vue いずれからも `<command-dock>` を置くだけで使える。スタイルは Shadow DOM に
閉じ込め、テーマは CSS 変数で受ける(`--dock-*` を最優先、無ければホストアプリの汎用変数へ
フォールバック)。

## インストール

```jsonc
// git 依存(リポジトリを push 後)
"dependencies": { "command-dock": "github:yanqirenshi/command-dock#v0.1.0" }

// ローカル開発時
"dependencies": { "command-dock": "file:../command-dock" }
```

## 使い方

```ts
import "command-dock"; // 副作用 import: <command-dock> を登録する(必須)
import type { DockItem } from "command-dock";

const dock = document.querySelector("command-dock")!;
dock.items = [
  {
    id: "file",
    label: "F",
    title: "ファイル操作 (F)",
    popup: [
      { icon: "<svg…>", label: "新規作成", onSelect: () => handleNew() },
      { icon: "<svg…>", label: "開く", onSelect: () => handleOpen() },
    ],
  },
  {
    id: "view",
    label: "V",
    title: "表示設定 (V)",
    popup: {
      section: "表示モード",
      items: [
        { label: "エディタ", active: () => mode === "editor", onSelect: () => setMode("editor") },
        { label: "分割",     active: () => mode === "split",  onSelect: () => setMode("split") },
      ],
    },
  },
];

// 外部状態が変わったら、開いている popup の active 表示を再評価
dock.refresh();
```

> **重要:** 登録は必ず `import "command-dock";`(副作用 import)で行う。型としてしか使わないと
> 本番ビルドの tree-shake で `customElements.define` が落ち、要素が登録されない。本パッケージは
> `package.json` の `sideEffects` で保護しているが、利用側でも副作用 import を徹底すること。

## API

`<command-dock>` 要素(`CommandDock`):

- プロパティ `items: DockItem[]` — 代入で再描画
- メソッド `open(id)` / `closeAll()` / `refresh()`
- イベント `select`(`detail: { dockId, index, label }`、`bubbles` + `composed`)

配置は既定で下部中央(`:host { position:absolute; bottom:28px; left:50% }`)。包含ブロックを持つ
親(`position: relative` など)の中に置くと、その親基準で配置される。

## テーマ契約(CSS 変数)

| 変数 | フォールバック | 用途 |
|---|---|---|
| `--dock-bg` | `--bg-secondary` | ボタン/ポップオーバー背景 |
| `--dock-fg` | `--text-primary` | 文字色 |
| `--dock-border` | `--border-color` | 枠線 |
| `--dock-accent` | `--accent-color` | hover/active のアクセント |
| `--dock-accent-bg` | `--dock-accent` | active ボタンの塗り |
| `--dock-accent-fg` | `#fff` | active ボタンの文字 |
| `--dock-glow` | 青系 | active ボタンの影色 |
| `--dock-bg-hover` / `--dock-active-bg` / `--dock-muted` / `--dock-shadow` | 各汎用変数 | hover背景 / 選択中背景 / 見出し / 影 |
| `--dock-bottom` / `--dock-gap` / `--dock-z` | 28px / 16px / 100 | 位置・間隔・重なり |

CSS 変数は Shadow DOM を貫通するので、ホスト側でテーマクラスに `--dock-*` を定義すれば上書きできる。

## ビルド

```sh
npm install
npm run build   # tsc が dist/ に ESM + 型定義を出力
```

git 依存でインストールされる際は `prepare` スクリプトで自動ビルドされる。
