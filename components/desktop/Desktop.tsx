"use client";

import { useWindowManager } from "./useWindowManager";
import { AppWindow } from "./AppWindow";
import { AppContent } from "./AppContent";
import { MenuBar } from "./MenuBar";
import { Sidebar } from "./Dock";

export function Desktop() {
  const { state } = useWindowManager();

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Floating sidebar (absolutely positioned) */}
      <Sidebar />

      {/* Top menu bar */}
      <MenuBar />

      {/* Windows area (full width, below menu bar) */}
      <div className="absolute inset-0 top-7">
        {state.windows.map((win) => (
          <AppWindow key={win.id} windowState={win}>
            <AppContent appId={win.appId} title={win.title} context={win.context} />
          </AppWindow>
        ))}
      </div>
    </div>
  );
}
