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

/** dock 上の円形トリガー 1 個と、その上に出るポップオーバー。 */
export interface DockItem {
  /** 一意な ID(open()/イベントで使う)。 */
  id: string;
  /** ボタン面のラベル。文字("F" など)でも SVG/HTML 文字列でも可。 */
  label: string;
  /** ネイティブ title 属性。 */
  title?: string;
  /** ポップオーバーの中身。 */
  popup: PopupContent;
}

/** `select` カスタムイベントの detail。 */
export interface DockSelectDetail {
  dockId: string;
  index: number;
  label: string;
}
