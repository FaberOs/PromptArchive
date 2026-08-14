"use client";

import { createContext, useCallback, useMemo } from "react";
import { requestSuiteTheme, useSuiteTheme } from "@suite/ui";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSuiteTheme();
  const toggleTheme = useCallback(() => {
    requestSuiteTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);
  const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}
