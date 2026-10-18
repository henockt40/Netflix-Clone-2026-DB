import { createContext, useContext, useEffect, useState } from "react";
import { authRequest } from "./authApi.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "netflix_clone_auth_token";

export function AuthProvider({ children }) {
  // Stored only for this browser tab; production apps typically use secure HTTP-only cookies.
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(sessionStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    if (!token) { setUser(null); setLoading(false); return; }
    let canceled = false;
    setLoading(true);
    authRequest("/auth/me", { token })
      .then((result) => { if (!canceled) setUser(result.user); })
      .catch(() => {
        if (!canceled) {
          sessionStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => { if (!canceled) setLoading(false); });
    return () => { canceled = true; };
  }, [token]);

  async function authenticate(mode, fields) {
    const result = await authRequest(mode === "register" ? "/auth/register" : "/auth/login", {
      method: "POST", body: fields,
    });
    sessionStorage.setItem(TOKEN_KEY, result.token);
    setUser(result.user);
    setToken(result.token);
    return result.user;
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
