"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, clearSession } from "./api";

const AuthContext = createContext({
  user: null,
  member: null,
  loading: true,
  refresh: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    let loggedInUser = null;
    try {
      const { data } = await api.get("/auth/me");
      loggedInUser = data.user;
      setUser(data.user);
    } catch {
      setUser(null);
    }

    if (loggedInUser) {
      try {
        const { data } = await api.get("/members/me");
        setMember(data.member);
      } catch {
        setMember(null);
      }
    } else {
      setMember(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function logout() {
    clearSession();
    setUser(null);
    setMember(null);
  }

  return (
    <AuthContext.Provider value={{ user, member, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
