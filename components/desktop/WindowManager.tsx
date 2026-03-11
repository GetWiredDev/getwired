"use client";

import React from "react";
import { WindowManagerContext, useWindowManagerProvider } from "./useWindowManager";

export function WindowManagerProvider({ children }: { children: React.ReactNode }) {
  const value = useWindowManagerProvider();

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

