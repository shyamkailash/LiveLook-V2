import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "@/contexts/theme-context";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    window.localStorage.setItem("livelook-theme", "dark");
  }, []);

  function setTheme() {
    setThemeState("dark");
  }

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setThemeState("dark"),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
