import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const expired = () => setUser(null);
    window.addEventListener("auth-expired", expired);
    if (getToken()) {
      api
        .get("/api/auth/me")
        .then(setUser)
        .catch(() => setToken(null))
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
    return () => window.removeEventListener("auth-expired", expired);
  }, []);

  const value = {
    user,
    ready,
    login: (token, u) => {
      setToken(token);
      setUser(u);
    },
    logout: () => {
      setToken(null);
      setUser(null);
    },
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
