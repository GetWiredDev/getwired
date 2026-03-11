"use client";

import { useWindowManager } from "./useWindowManager";
import { AppWindow } from "./AppWindow";
import { AppContent } from "./AppContent";
import { MenuBar } from "./MenuBar";
import { Sidebar } from "./Dock";

export function Desktop() {
  const { state } = useWindowManager();

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Left sidebar */}
      <Sidebar />

      {/* Desktop area (takes remaining width) */}
      <div className="flex-1 relative flex flex-col min-w-0">
        {/* Top menu bar */}
        <MenuBar />

        {/* Windows area */}
        <div className="flex-1 relative">
          {state.windows.map((win) => (
            <AppWindow key={win.id} windowState={win}>
              <AppContent appId={win.appId} title={win.title} />
            </AppWindow>
          ))}
        </div>
      </div>
    </div>
  );
}
