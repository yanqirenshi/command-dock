// Shadow DOM 内へ注入するスタイル。クラス名は外へ漏れない(衝突しない)。
//
// テーマ契約: すべて CSS 変数で受ける。`--dock-*` を最優先で見て、無ければ
// ホストアプリの汎用変数(--bg-secondary 等)へフォールバックする。CSS 変数は
// Shadow DOM を貫通するので、アプリ側のテーマ切替がそのまま効く。上書きしたい
// ときだけ `--dock-*` を定義すればよい(例: cyberpunk の発光色)。

export const dockStyles = /* css */ `
:host {
  position: absolute;
  bottom: var(--dock-bottom, 28px);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--dock-z, 100);
  font-family: var(--dock-font, 'Outfit', sans-serif);
}

.bar {
  display: flex;
  gap: var(--dock-gap, 16px);
  padding: 8px 16px;
}

.item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.circle-btn {
  position: relative;
  box-sizing: border-box;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--dock-bg, var(--bg-secondary, #ffffff));
  border: 1px solid var(--dock-border, var(--border-color, #e5e7eb));
  color: var(--dock-fg, var(--text-primary, #0f172a));
  font-family: inherit;
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px var(--dock-shadow, var(--shadow, rgba(0, 0, 0, 0.12)));
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.circle-btn:hover {
  background: var(--dock-bg-hover, var(--bg-tertiary, #f3f4f6));
  border-color: var(--dock-accent, var(--accent-color, #3b82f6));
  color: var(--dock-accent, var(--accent-color, #3b82f6));
  transform: translateY(-4px);
}

/* 吹き出し型トリガー: 閉時は太い縁取り(3px)・背景白。
   縁取り色は薄いパステルブルーを常時表示する(--dock-trigger-border で上書き可)。 */
.circle-btn.popup-trigger {
  border-width: var(--dock-trigger-border-width, 3px);
  border-color: var(--dock-trigger-border, #bfdbfe);
}

/* 吹き出し型トリガー: 開時は縁取りを透明(非表示)に・背景白のまま。 */
.circle-btn.popup-trigger.active {
  background: var(--dock-bg, var(--bg-secondary, #ffffff));
  border-color: transparent;
  color: var(--dock-fg, var(--text-primary, #0f172a));
  transform: none;
  box-shadow: 0 4px 12px var(--dock-shadow, var(--shadow, rgba(0, 0, 0, 0.12)));
}

/* 即アクション型: 無効・実行中 */
.circle-btn:disabled {
  cursor: default;
  opacity: 0.55;
}

.circle-btn:disabled:hover {
  background: var(--dock-bg, var(--bg-secondary, #ffffff));
  border-color: var(--dock-border, var(--border-color, #e5e7eb));
  color: var(--dock-fg, var(--text-primary, #0f172a));
  transform: none;
}

/* busy: onClick の Promise を待つ間。ラベルを隠してスピナーを重ねる。 */
.circle-btn.busy {
  color: transparent;
  opacity: 1;
}

.circle-btn.busy::after {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--dock-accent, var(--accent-color, #3b82f6));
  border-top-color: transparent;
  animation: dock-spin 0.6s linear infinite;
}

@keyframes dock-spin {
  to { transform: rotate(360deg); }
}

/* ポップオーバー(吹き出し) */
.popup {
  position: absolute;
  bottom: 58px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--dock-bg, var(--bg-secondary, #ffffff));
  border: 1px solid var(--dock-border, var(--border-color, #e5e7eb));
  border-radius: 12px;
  box-shadow: 0 10px 30px var(--dock-shadow, var(--shadow, rgba(0, 0, 0, 0.18)));
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 170px;
  z-index: 110;
  transition: transform 0.15s ease-out, opacity 0.15s ease-out;
}

.popup.hidden {
  display: none;
}

/* 吹き出しの三角矢印 */
.popup::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: var(--dock-bg, var(--bg-secondary, #ffffff));
  border-right: 1px solid var(--dock-border, var(--border-color, #e5e7eb));
  border-bottom: 1px solid var(--dock-border, var(--border-color, #e5e7eb));
}

.popup-item {
  background: transparent;
  border: none;
  outline: none;
  color: var(--dock-fg, var(--text-primary, #0f172a));
  padding: 8px 12px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  transition: background-color 0.2s, color 0.2s;
  white-space: nowrap;
}

.popup-item:hover {
  background: var(--dock-bg-hover, var(--bg-tertiary, #f3f4f6));
  color: var(--dock-accent, var(--accent-color, #3b82f6));
}

.popup-item.active {
  background: var(--dock-active-bg, var(--active-btn-bg, #e5e7eb));
  color: var(--dock-accent, var(--accent-color, #3b82f6));
}

.section {
  padding: 4px 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  box-sizing: border-box;
}

.section-title {
  font-size: 10px;
  font-weight: 600;
  color: var(--dock-muted, var(--text-secondary, #6b7280));
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}
`;
