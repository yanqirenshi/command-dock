import { dockStyles } from "./styles.js";
import type {
  ActionDockItem,
  DockActionDetail,
  DockItem,
  DockSelectDetail,
  PopupContent,
  PopupDockItem,
  PopupGroup,
  PopupItem,
} from "./types.js";

/** 即アクション型(onClick を持つ)かどうかの判別。 */
function isActionItem(item: DockItem): item is ActionDockItem {
  return "onClick" in item;
}

/** PopupContent を PopupGroup[] に正規化する。 */
function normalizePopup(content: PopupContent): PopupGroup[] {
  if (Array.isArray(content)) {
    if (content.length > 0 && "items" in content[0]) {
      return content as PopupGroup[];
    }
    return [{ items: content as PopupItem[] }];
  }
  return [content];
}

interface Entry {
  item: DockItem;
  btn: HTMLButtonElement;
  /** 吹き出し型のみ。即アクション型は null。 */
  popup: HTMLElement | null;
  /** active 述語を再評価するための (要素, 定義) 対(吹き出し型のみ)。 */
  itemEls: Array<{ el: HTMLElement; def: PopupItem }>;
}

/**
 * `<command-dock>` — 下部中央のフローティング・コマンドドック。
 *
 * 円形トリガーの行と、各トリガーの上に出るポップオーバーを描画する。
 * 挙動(単一開閉・外クリックで閉じる・項目選択で自動クローズ)を内蔵し、
 * 中身は `items` プロパティで宣言的に注入する。
 */
export class CommandDock extends HTMLElement {
  private _items: DockItem[] = [];
  private readonly root: ShadowRoot;
  private bar: HTMLElement | null = null;
  private readonly entries = new Map<string, Entry>();
  private openId: string | null = null;

  /** 外クリックで閉じる。Shadow を貫通する composedPath で内外を判定。 */
  private readonly onDocClick = (e: MouseEvent) => {
    if (e.composedPath().includes(this)) return;
    this.closeAll();
  };

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  /** ドック項目。代入すると再描画する。 */
  set items(value: DockItem[]) {
    this._items = value ?? [];
    if (this.isConnected) this.render();
  }
  get items(): DockItem[] {
    return this._items;
  }

  connectedCallback() {
    if (!this.bar) this.render();
    document.addEventListener("click", this.onDocClick);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.onDocClick);
  }

  /** 指定 ID のポップオーバーを開く(他は閉じる)。即アクション型 ID は無視。 */
  open(id: string) {
    if (this.openId === id) return;
    this.closeAll();
    const entry = this.entries.get(id);
    if (!entry || !entry.popup) return;
    entry.popup.classList.remove("hidden");
    entry.btn.classList.add("active");
    this.openId = id;
    this.applyActive(entry);
  }

  /** すべてのポップオーバーを閉じる。 */
  closeAll() {
    for (const entry of this.entries.values()) {
      entry.popup?.classList.add("hidden");
      entry.btn.classList.remove("active");
    }
    this.openId = null;
  }

  /**
   * 開いているポップオーバーの active 状態と、即アクション型の disabled 述語を
   * 再評価する。外部状態が変わったときに呼ぶ。
   */
  refresh() {
    if (this.openId) {
      const entry = this.entries.get(this.openId);
      if (entry) this.applyActive(entry);
    }
    for (const entry of this.entries.values()) {
      if (isActionItem(entry.item)) this.applyDisabled(entry, entry.item);
    }
  }

  private toggle(id: string) {
    if (this.openId === id) {
      this.closeAll();
    } else {
      this.open(id);
    }
  }

  private applyActive(entry: Entry) {
    for (const { el, def } of entry.itemEls) {
      const isActive =
        typeof def.active === "function" ? def.active() : !!def.active;
      el.classList.toggle("active", isActive);
    }
  }

  /** 即アクション型ボタンの disabled 述語を反映する(busy 中は触らない)。 */
  private applyDisabled(entry: Entry, item: ActionDockItem) {
    if (entry.btn.classList.contains("busy")) return;
    const disabled =
      typeof item.disabled === "function" ? item.disabled() : !!item.disabled;
    entry.btn.disabled = disabled;
  }

  /**
   * 即アクション型のクリック処理。実行中はボタンを disabled + busy 表示にし、
   * onClick が Promise を返せばその解決(または reject)まで待つ。
   */
  private async runAction(item: ActionDockItem, entry: Entry) {
    if (entry.btn.disabled) return;
    this.closeAll();

    entry.btn.disabled = true;
    entry.btn.classList.add("busy");
    this.dispatchEvent(
      new CustomEvent<DockActionDetail>("action", {
        bubbles: true,
        composed: true,
        detail: { dockId: item.id, label: item.label },
      }),
    );
    try {
      await item.onClick({ dockId: item.id });
    } finally {
      entry.btn.classList.remove("busy");
      // busy 解除後に述語ベースの disabled を改めて反映する。
      this.applyDisabled(entry, item);
    }
  }

  private render() {
    this.root.replaceChildren();
    this.entries.clear();
    this.openId = null;

    const style = document.createElement("style");
    style.textContent = dockStyles;
    this.root.appendChild(style);

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.setAttribute("role", "toolbar");

    for (const item of this._items) {
      const container = document.createElement("div");
      container.className = "item";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "circle-btn";
      btn.part.add("circle");
      btn.innerHTML = item.label;
      btn.title = item.title ?? "";

      let popup: HTMLElement | null = null;
      let itemEls: Array<{ el: HTMLElement; def: PopupItem }> = [];
      const entry: Entry = { item, btn, popup, itemEls };

      if (isActionItem(item)) {
        // 即アクション型: クリックで onClick を実行。
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          void this.runAction(item, entry);
        });
        container.appendChild(btn);
        this.applyDisabled(entry, item);
      } else {
        // 吹き出し型: クリックでポップオーバーを開閉。
        btn.classList.add("popup-trigger");
        const built = this.buildPopup(item);
        popup = built.popup;
        itemEls = built.itemEls;
        entry.popup = popup;
        entry.itemEls = itemEls;
        container.appendChild(popup);
        btn.setAttribute("aria-haspopup", "true");
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggle(item.id);
        });
        container.appendChild(btn);
      }

      bar.appendChild(container);
      this.entries.set(item.id, entry);
    }

    this.root.appendChild(bar);
    this.bar = bar;
  }

  private buildPopup(item: PopupDockItem): {
    popup: HTMLElement;
    itemEls: Array<{ el: HTMLElement; def: PopupItem }>;
  } {
    const popup = document.createElement("div");
    popup.className = "popup hidden";
    popup.part.add("popup");

    const itemEls: Array<{ el: HTMLElement; def: PopupItem }> = [];
    const groups = normalizePopup(item.popup);

    groups.forEach((group) => {
      const host = group.section ? document.createElement("div") : popup;
      if (group.section) {
        host.className = "section";
        const title = document.createElement("span");
        title.className = "section-title";
        title.textContent = group.section;
        host.appendChild(title);
      }

      group.items.forEach((def, index) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "popup-item";
        el.part.add("popup-item");
        el.title = def.title ?? def.label;
        el.innerHTML = `${def.icon ?? ""}<span>${def.label}</span>`;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          def.onSelect?.({ dockId: item.id, index });
          this.dispatchEvent(
            new CustomEvent<DockSelectDetail>("select", {
              bubbles: true,
              composed: true,
              detail: { dockId: item.id, index, label: def.label },
            }),
          );
          if (def.closeOnSelect !== false) {
            // 選択フィードバックを少し見せてから閉じる(元実装と同じ 120ms)。
            setTimeout(() => this.closeAll(), 120);
          } else {
            this.refresh();
          }
        });
        host.appendChild(el);
        itemEls.push({ el, def });
      });

      if (group.section) popup.appendChild(host);
    });

    return { popup, itemEls };
  }
}

if (!customElements.get("command-dock")) {
  customElements.define("command-dock", CommandDock);
}

declare global {
  interface HTMLElementTagNameMap {
    "command-dock": CommandDock;
  }
}
