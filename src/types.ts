// command-dock の公開型。フレームワーク非依存で、items を渡すと下部中央の
// 円形トリガー + ポップオーバーを生成する。中身(ラベル・ハンドラ)はアプリが注入する。

/** ポップオーバー内の 1 項目。 */
export interface PopupItem {
  /** 表示ラベル。 */
  label: string;
  /** 先頭に置くアイコン(生 SVG/HTML 文字列)。省略可。 */
  icon?: string;
  /** ネイティブ title 属性。省略時は label を使う。 */
  title?: string;
  /**
   * アクティブ状態。真偽値、または開くたびに再評価する述語。
   * 述語にしておくと、外部状態(表示モード等)の変化を popup を開いた時点で反映できる。
   */
  active?: boolean | (() => boolean);
  /** 選択時のコールバック。 */
  onSelect?: (ctx: { dockId: string; index: number }) => void;
  /** 選択後にポップオーバーを閉じるか。既定 true。 */
  closeOnSelect?: boolean;
}

/** 見出し付きの項目グループ。 */
export interface PopupGroup {
  /** セクション見出し(任意)。 */
  section?: string;
  items: PopupItem[];
}

/** popup に渡せる形。フラットな項目配列でもグループでもよい。 */
export type PopupContent = PopupItem[] | PopupGroup | PopupGroup[];

/** dock 上の円形トリガー全種に共通の属性。 */
export interface DockItemBase {
  /** 一意な ID(open()/イベントで使う)。 */
  id: string;
  /** ボタン面のラベル。文字("F" など)でも SVG/HTML 文字列でも可。 */
  label: string;
  /** ネイティブ title 属性。 */
  title?: string;
}

/**
 * 吹き出し型トリガー。クリックでポップオーバーを開く(単一オープン)。
 * `popup` を持つことが、即アクション型との判別子になる。
 */
export interface PopupDockItem extends DockItemBase {
  /** ポップオーバーの中身。 */
  popup: PopupContent;
}

/**
 * 即アクション型トリガー。クリックで `onClick` を即実行する(吹き出しは出さない)。
 * `onClick` を持つことが、吹き出し型との判別子になる。
 */
export interface ActionDockItem extends DockItemBase {
  /**
   * クリック時に実行する処理。Promise を返すと、その解決(または reject)まで
   * ボタンを自動で disabled + busy 表示にする(例: リフレッシュ中の二重実行防止)。
   */
  onClick: (ctx: { dockId: string }) => void | Promise<void>;
  /**
   * 無効化状態。真偽値、または再評価する述語。述語にしておくと外部状態の変化を
   * `refresh()` で反映できる。busy 中(onClick の実行中)は値に関わらず無効化される。
   */
  disabled?: boolean | (() => boolean);
}

/**
 * dock 上の円形トリガー 1 個。
 * `popup` を持てば吹き出し型、`onClick` を持てば即アクション型(判別ユニオン)。
 */
export type DockItem = PopupDockItem | ActionDockItem;

/** `select` カスタムイベントの detail。 */
export interface DockSelectDetail {
  dockId: string;
  index: number;
  label: string;
}

/** `action` カスタムイベントの detail(即アクション型のクリック時に発火)。 */
export interface DockActionDetail {
  dockId: string;
  label: string;
}
