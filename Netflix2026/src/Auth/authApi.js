// Auth only: TMDB still uses the original src/Utility/MovieInstance.js.
const API_ROOT = (import.meta.env.VITE_AUTH_API_URL || "/api").replace(/\/$/, "");

export async function authRequest(path, { method = "GET", body, token } = {}) {
  let response;
  try {
    response = await fetch(`${API_ROOT}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error("Could not reach the auth server. Start the Express backend on port 3777.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Request failed. Please try again.");
    error.status = response.status;
    throw error;
  }
  return data;
}
