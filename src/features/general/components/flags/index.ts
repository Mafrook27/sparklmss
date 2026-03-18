export { default } from "./FlagsConfiguration";

// Named exports for if sub-components are ever needed directly
export { default as FlagCard  } from "./FlagCard";
export { default as Column    } from "./Column";
export { default as FABPreview} from "./FABPreview";
export { default as InfoModal } from "./InfoModal";
export { default as EditModal } from "./EditModal";

// Types
export type { FlagItem, FlagState, ColumnType, FlagTheme } from "./types";
