import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Season = "spring" | "summer" | "fall" | "winter";

export interface AuthUser {
  id: string;
  username: string;
  profilePicture: string | null;
}

interface ThemeContextType {
  season: Season;
  setSeason: (s: Season) => void;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfilePicture: (base64: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("messy-user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id && parsed.username) {
      const pfp = localStorage.getItem(`messy-pfp-${parsed.username}`) || null;
      return { ...parsed, profilePicture: pfp };
    }
    return null;
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [season, setSeasonState] = useState<Season>(() => {
    return (localStorage.getItem("messy-season") as Season) || "spring";
  });

  const [user, setUser] = useState<AuthUser | null>(() => loadUser());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-spring", "theme-summer", "theme-fall", "theme-winter");
    root.classList.add(`theme-${season}`);
    localStorage.setItem("messy-season", season);
  }, [season]);

  const setSeason = (s: Season) => setSeasonState(s);

  const login = async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Login failed");
    }
    const data = await res.json();
    const pfp = localStorage.getItem(`messy-pfp-${data.username}`) || null;
    const authUser: AuthUser = { id: data.id, username: data.username, profilePicture: pfp };
    localStorage.setItem("messy-user", JSON.stringify({ id: data.id, username: data.username }));
    setUser(authUser);
  };

  const register = async (username: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Registration failed");
    }
    const data = await res.json();
    const authUser: AuthUser = { id: data.id, username: data.username, profilePicture: null };
    localStorage.setItem("messy-user", JSON.stringify({ id: data.id, username: data.username }));
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem("messy-user");
    setUser(null);
  };

  const updateProfilePicture = (base64: string) => {
    if (!user) return;
    localStorage.setItem(`messy-pfp-${user.username}`, base64);
    setUser({ ...user, profilePicture: base64 });
  };

  return (
    <ThemeContext.Provider value={{ season, setSeason, user, login, register, logout, updateProfilePicture }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
