// command-dock パッケージのエントリ。
// import するだけで <command-dock> がカスタム要素として登録される(副作用)。
import "./command-dock";

export { CommandDock } from "./command-dock";
export type {
  DockItem,
  PopupItem,
  PopupGroup,
  PopupContent,
  DockSelectDetail,
} from "./types";
