/** Consistent JSON error responses for Express API routes. */
export function notFound(_req, res) {
  return res.status(404).json({ message: "API route not found." });
}

export function errorHandler(error, _req, res, _next) {
  console.error("Auth API error:", error.message);
  const status = error.type === "entity.too.large" ? 413 : ([400, 503].includes(error.status) ? error.status : 500);
  return res.status(status).json({ message: status === 500 ? "Server error. Please try again." : (status === 413 ? "Request body too large." : error.message) });
}
