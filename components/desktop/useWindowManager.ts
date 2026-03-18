"use client";

import { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import type {
  WindowState,
  WindowManagerState,
  WindowManagerAction,
  WindowManagerContextValue,
  WindowPosition,
  WindowSize,
  AppRegistryEntry,
  OpenWindowOptions,
} from "./types";

// ── App Registry ──────────────────────────────────────────────────────────────

export const APP_REGISTRY: Record<string, AppRegistryEntry> = {
  feed: { id: "feed", title: "Feed", icon: "Rss", defaultSize: { width: 680, height: 700 } },
  forums: { id: "forums", title: "Forums", icon: "MessageSquare", defaultSize: { width: 820, height: 720 } },
  chat: { id: "chat", title: "Chat", icon: "MessagesSquare", defaultSize: { width: 440, height: 640 } },
  news: { id: "news", title: "News", icon: "Newspaper", defaultSize: { width: 780, height: 700 } },
  discover: { id: "discover", title: "Discover", icon: "Compass", defaultSize: { width: 720, height: 740 } },
  marketplace: { id: "marketplace", title: "Amplify", icon: "Rocket", defaultSize: { width: 820, height: 700 } },
  profile: { id: "profile", title: "Profile", icon: "User", defaultSize: { width: 640, height: 680 } },
  bookmarks: { id: "bookmarks", title: "Bookmarks", icon: "Bookmark", defaultSize: { width: 540, height: 580 } },
  notifications: { id: "notifications", title: "Notifications", icon: "Bell", defaultSize: { width: 440, height: 600 } },
  search: { id: "search", title: "Search", icon: "Search", defaultSize: { width: 640, height: 580 } },
  admin: { id: "admin", title: "Admin", icon: "Shield", defaultSize: { width: 880, height: 720 } },
  newsletter: { id: "newsletter", title: "Newsletter", icon: "Mail", defaultSize: { width: 640, height: 640 } },
};

// ── LocalStorage Persistence ─────────────────────────────────────────────────

const STORAGE_KEY = "getwired-desktop-layout";

function saveToLocalStorage(state: WindowManagerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently fail (e.g. quota exceeded, SSR)
  }
}

function loadFromLocalStorage(): WindowManagerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.windows || !Array.isArray(parsed.windows)) return null;

    const validWindows: WindowState[] = [];
    for (const w of parsed.windows) {
      if (!w || typeof w !== "object" || typeof w.id !== "string") continue;
      const app = APP_REGISTRY[w.appId];
      if (!app) continue;

      // Merge saved values with registry defaults so resized windows are restored
      validWindows.push({
        id: w.id,
        appId: w.appId,
        title: w.title ?? app.title,
        icon: w.icon ?? app.icon,
        context: typeof w.context === "string" ? w.context : undefined,
        position: w.position ?? getStaggeredPosition(validWindows.length),
        size: w.size ?? { ...app.defaultSize },
        zIndex: typeof w.zIndex === "number" ? w.zIndex : validWindows.length + 1,
        isMinimized: w.isMinimized ?? false,
        isMaximized: w.isMaximized ?? false,
      });
    }

    return {
      windows: validWindows,
      nextZIndex: parsed.nextZIndex || validWindows.length + 1,
    };
  } catch {
    return null;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STAGGER_OFFSET = 30;
const BASE_POSITION = { x: 80, y: 60 };

function generateWindowId(): string {
  return `win-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getStaggeredPosition(existingCount: number): WindowPosition {
  return {
    x: BASE_POSITION.x + (existingCount % 10) * STAGGER_OFFSET,
    y: BASE_POSITION.y + (existingCount % 10) * STAGGER_OFFSET,
  };
}

// ── Reducer ───────────────────────────────────────────────────────────────────

const initialState: WindowManagerState = {
  windows: [],
  nextZIndex: 1,
};

function windowManagerReducer(
  state: WindowManagerState,
  action: WindowManagerAction,
): WindowManagerState {
  switch (action.type) {
    case "OPEN_WINDOW": {
      const app = APP_REGISTRY[action.appId];
      if (!app) return state;

      // If a window for this app already exists, focus it instead of creating a new one
      const existing = state.windows.find((w) => w.appId === action.appId);
      if (existing) {
        return {
          windows: state.windows.map((w) =>
            w.id === existing.id
              ? {
                  ...w,
                  title: action.title ?? w.title,
                  context: action.context ?? w.context,
                  isMinimized: false,
                  zIndex: state.nextZIndex,
                }
              : w,
          ),
          nextZIndex: state.nextZIndex + 1,
        };
      }

      const position = getStaggeredPosition(state.windows.length);
      const newWindow: WindowState = {
        id: generateWindowId(),
        appId: action.appId,
        title: action.title ?? app.title,
        icon: app.icon,
        context: action.context,
        position,
        size: { ...app.defaultSize },
        zIndex: state.nextZIndex,
        isMinimized: false,
        isMaximized: false,
      };

      return {
        windows: [...state.windows, newWindow],
        nextZIndex: state.nextZIndex + 1,
      };
    }

    case "CLOSE_WINDOW":
      return {
        ...state,
        windows: state.windows.filter((w) => w.id !== action.windowId),
      };

    case "MINIMIZE_WINDOW":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.windowId ? { ...w, isMinimized: true } : w,
        ),
      };

    case "MAXIMIZE_WINDOW":
      return {
        windows: state.windows.map((w) =>
          w.id === action.windowId
            ? { ...w, isMaximized: true, isMinimized: false, zIndex: state.nextZIndex }
            : w,
        ),
        nextZIndex: state.nextZIndex + 1,
      };

    case "RESTORE_WINDOW":
      return {
        windows: state.windows.map((w) =>
          w.id === action.windowId
            ? { ...w, isMinimized: false, isMaximized: false, zIndex: state.nextZIndex }
            : w,
        ),
        nextZIndex: state.nextZIndex + 1,
      };

    case "FOCUS_WINDOW":
      return {
        windows: state.windows.map((w) =>
          w.id === action.windowId
            ? { ...w, isMinimized: false, zIndex: state.nextZIndex }
            : w,
        ),
        nextZIndex: state.nextZIndex + 1,
      };

    case "UPDATE_POSITION":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.windowId ? { ...w, position: action.position } : w,
        ),
      };

    case "UPDATE_SIZE":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.windowId ? { ...w, size: action.size } : w,
        ),
      };

    case "RESTORE_STATE":
      return action.state;

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

export const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWindowManager(): WindowManagerContextValue {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error("useWindowManager must be used within a WindowManagerProvider");
  }
  return context;
}

// ── Provider helper ───────────────────────────────────────────────────────────

export function useWindowManagerProvider(): WindowManagerContextValue {
  const [state, dispatch] = useReducer(windowManagerReducer, initialState);

  // Restore state from localStorage on mount, or open defaults for first-time visitors
  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved && saved.windows.length > 0) {
      dispatch({ type: "RESTORE_STATE", state: saved });
    } else {
      // First visit: open Feed, Forums, and News by default
      const defaultApps = ["feed", "forums", "news"];
      for (const appId of defaultApps) {
        dispatch({ type: "OPEN_WINDOW", appId });
      }
    }
  }, []);

  // Debounce-save state to localStorage on every change
  useEffect(() => {
    const timer = setTimeout(() => saveToLocalStorage(state), 500);
    return () => clearTimeout(timer);
  }, [state]);

  const openWindow = useCallback((appId: string, options?: OpenWindowOptions) => {
    dispatch({
      type: "OPEN_WINDOW",
      appId,
      title: options?.title,
      context: options?.context,
    });
  }, []);
  const closeWindow = useCallback(
    (windowId: string) => dispatch({ type: "CLOSE_WINDOW", windowId }),
    [],
  );
  const minimizeWindow = useCallback(
    (windowId: string) => dispatch({ type: "MINIMIZE_WINDOW", windowId }),
    [],
  );
  const maximizeWindow = useCallback(
    (windowId: string) => dispatch({ type: "MAXIMIZE_WINDOW", windowId }),
    [],
  );
  const restoreWindow = useCallback(
    (windowId: string) => dispatch({ type: "RESTORE_WINDOW", windowId }),
    [],
  );
  const focusWindow = useCallback(
    (windowId: string) => dispatch({ type: "FOCUS_WINDOW", windowId }),
    [],
  );
  const updateWindowPosition = useCallback(
    (windowId: string, position: WindowPosition) =>
      dispatch({ type: "UPDATE_POSITION", windowId, position }),
    [],
  );
  const updateWindowSize = useCallback(
    (windowId: string, size: WindowSize) =>
      dispatch({ type: "UPDATE_SIZE", windowId, size }),
    [],
  );

  return {
    state,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
  };
}
