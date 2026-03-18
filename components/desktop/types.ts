// Window manager types for the desktop UI

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: string; // lucide icon name
  context?: string;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

export interface AppRegistryEntry {
  id: string;
  title: string;
  icon: string; // lucide icon name
  defaultSize: WindowSize;
}

export interface OpenWindowOptions {
  title?: string;
  context?: string;
}

export type WindowManagerAction =
  | { type: "OPEN_WINDOW"; appId: string; title?: string; context?: string }
  | { type: "CLOSE_WINDOW"; windowId: string }
  | { type: "MINIMIZE_WINDOW"; windowId: string }
  | { type: "MAXIMIZE_WINDOW"; windowId: string }
  | { type: "RESTORE_WINDOW"; windowId: string }
  | { type: "FOCUS_WINDOW"; windowId: string }
  | { type: "UPDATE_POSITION"; windowId: string; position: WindowPosition }
  | { type: "UPDATE_SIZE"; windowId: string; size: WindowSize }
  | { type: "RESTORE_STATE"; state: WindowManagerState };

export interface WindowManagerState {
  windows: WindowState[];
  nextZIndex: number;
}

export interface WindowManagerContextValue {
  state: WindowManagerState;
  openWindow: (appId: string, options?: OpenWindowOptions) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, position: WindowPosition) => void;
  updateWindowSize: (windowId: string, size: WindowSize) => void;
}
