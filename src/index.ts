// command-dock パッケージのエントリ。
// import するだけで <command-dock> がカスタム要素として登録される(副作用)。
import "./command-dock.js";

export { CommandDock } from "./command-dock.js";
export type {
  DockItem,
  PopupItem,
  PopupGroup,
  PopupContent,
  DockSelectDetail,
} from "./types.js";
