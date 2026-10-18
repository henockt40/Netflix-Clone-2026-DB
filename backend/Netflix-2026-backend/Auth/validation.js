export function validateAuthInput(body = {}, registering = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Invalid request.";
  if (registering && (typeof body.fullName !== "string" || !body.fullName.trim() || body.fullName.trim().length > 120)) return "Enter your full name (up to 120 characters).";
  if (typeof body.email !== "string" || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return "Enter a valid email address.";
  if (typeof body.password !== "string" || body.password.length < (registering ? 8 : 1) || body.password.length > 128) return registering ? "Password must be 8–128 characters." : "Enter your password.";
  return null;
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
