import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Season = "spring" | "summer" | "fall" | "winter";

interface ThemeContextType {
  season: Season;
  setSeason: (s: Season) => void;
  user: string | null;
  login: (name: string) => void;
  logout: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [season, setSeasonState] = useState<Season>(() => {
    return (localStorage.getItem("messy-season") as Season) || "spring";
  });

  const [user, setUser] = useState<string | null>(() => {
    return localStorage.getItem("messy-user");
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-spring", "theme-summer", "theme-fall", "theme-winter");
    root.classList.add(`theme-${season}`);
    localStorage.setItem("messy-season", season);
  }, [season]);

  const setSeason = (s: Season) => setSeasonState(s);

  const login = (name: string) => {
    localStorage.setItem("messy-user", name);
    setUser(name);
  };

  const logout = () => {
    localStorage.removeItem("messy-user");
    setUser(null);
  };

  return (
    <ThemeContext.Provider value={{ season, setSeason, user, login, logout }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
