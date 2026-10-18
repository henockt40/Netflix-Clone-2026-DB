import AuthPage from "./AuthPage.jsx";
import { useAuth } from "./AuthContext.jsx";

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <main style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "35vh 16px", textAlign: "center" }}>Checking your session…</main>;
  return user ? children : <AuthPage />;
}
