"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { api, ApiError, clearToken, getToken, setToken } from "@/lib/api";
import type { AuthUser, ListResponse, Listing } from "@/lib/types";

interface RawUser extends Omit<AuthUser, "_id"> {
  _id?: string;
  id?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  college?: string;
  course?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  favorites: Listing[];
  favoriteIds: string[];
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  toggleFavorite: (listingId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUser(raw: RawUser): AuthUser {
  return { ...raw, _id: raw._id || raw.id || "" };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Listing[]>([]);

  useEffect(() => {
    let active = true;
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const res = await api<{ user: RawUser }>("/api/auth/me", {
          auth: true,
        });
        if (active) {
          setUser(normalizeUser(res.user));
        }
      } catch {
        clearToken();
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  const refreshFavorites = useCallback(async () => {
    if (!getToken()) {
      setFavorites([]);
      return;
    }

    try {
      const res = await api<ListResponse<Listing>>("/api/favorites", {
        auth: true,
      });
      setFavorites(res.data);
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void refreshFavorites();
    } else {
      setFavorites([]);
    }
  }, [user, refreshFavorites]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{ token: string; user: RawUser }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });

    setToken(res.token);
    const normalized = normalizeUser(res.user);
    setUser(normalized);
    return normalized;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await api<{ token: string; user: RawUser }>(
      "/api/auth/register",
      {
        method: "POST",
        body: payload,
      }
    );

    setToken(res.token);
    const normalized = normalizeUser(res.user);
    setUser(normalized);
    return normalized;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setFavorites([]);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api<{ user: RawUser }>("/api/auth/me", {
        auth: true,
      });
      setUser(normalizeUser(res.user));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
      }
      throw error;
    }
  }, [logout]);

  const toggleFavorite = useCallback(
    async (listingId: string) => {
      if (!getToken()) {
        throw new ApiError("Please log in to save favorites", 401);
      }

      const exists = favorites.some((listing) => listing._id === listingId);

      await api(`/api/favorites/${listingId}`, {
        method: exists ? "DELETE" : "POST",
        auth: true,
      });

      await refreshFavorites();
      return !exists;
    },
    [favorites, refreshFavorites]
  );

  const favoriteIds = useMemo(
    () => favorites.map((listing) => listing._id),
    [favorites]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      favorites,
      favoriteIds,
      login,
      register,
      logout,
      refreshUser,
      refreshFavorites,
      toggleFavorite,
    }),
    [
      user,
      loading,
      favorites,
      favoriteIds,
      login,
      register,
      logout,
      refreshUser,
      refreshFavorites,
      toggleFavorite,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
