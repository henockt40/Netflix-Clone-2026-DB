import { useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import netflixLogo from "../assets/image/logo.png";
import styles from "./AuthPage.module.css";

export default function AuthPage() {
  const { authenticate } = useAuth();
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await authenticate(mode, {
        ...(mode === "register" ? { fullName: fullName.trim() } : {}),
        email: email.trim(), password,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  }

  return (
    <main className={styles.page}>
      <header className={styles.top}><img src={netflixLogo} alt="Netflix Clone" /></header>
      <section className={styles.panel} aria-label={mode === "login" ? "Sign in" : "Create an account"}>
        <h1>{mode === "login" ? "Sign In" : "Sign Up"}</h1>
        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>Full name
              <input name="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required maxLength={120} />
            </label>
          )}
          <label>Email
            <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required maxLength={254} />
          </label>
          <label>Password
            <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required />
          </label>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" disabled={submitting} className={styles.submit}>
            {submitting ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
        <p className={styles.hint}>
          {mode === "login" ? "New to Netflix Clone? " : "Already have an account? "}
          <button type="button" onClick={switchMode} className={styles.switch}>
            {mode === "login" ? "Sign up now" : "Sign in"}
          </button>
        </p>
        <p className={styles.note}>Demo application — not affiliated with Netflix.</p>
      </section>
    </main>
  );
}
