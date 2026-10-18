import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const match = /^Bearer (\S+)$/i.exec(req.get("authorization") || "");
  if (!match) return res.status(401).json({ message: "Sign in required." });
  try {
    const claims = jwt.verify(match[1], process.env.JWT_SECRET, { issuer: "netflix-clone-auth" });
    const id = Number(claims.sub);
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid user ID");
    req.authUserId = id;
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please sign in again." });
  }
}
