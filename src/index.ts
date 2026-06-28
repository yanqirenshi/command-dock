// command-dock パッケージのエントリ。
// import するだけで <command-dock> がカスタム要素として登録される(副作用)。
import "./command-dock.js";

export { CommandDock } from "./command-dock.js";
export type {
  DockItem,
  DockItemBase,
  PopupDockItem,
  ActionDockItem,
  PopupItem,
  PopupGroup,
  PopupContent,
  DockSelectDetail,
  DockActionDetail,
} from "./types.js";
