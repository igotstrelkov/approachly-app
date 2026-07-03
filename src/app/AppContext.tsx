"use client";
import { createContext, useContext, type ReactNode } from "react";
import { useAppState } from "./useAppState";
export type AppValue = ReturnType<typeof useAppState>;
const AppContext = createContext<AppValue | null>(null);
export function AppProvider({
  value,
  children,
}: {
  value: AppValue;
  children: ReactNode;
}) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp(): AppValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
