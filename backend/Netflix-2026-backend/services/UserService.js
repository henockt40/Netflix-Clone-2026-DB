import { pool } from "../db/db.js";

// SQL lives in services; controllers handle request/response and authentication.
export async function createUser({ fullName, email, passwordHash }) {
  const [result] = await pool.execute(
    "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
    [fullName, email, passwordHash],
  );
  return { id: result.insertId, full_name: fullName, email };
}

export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    "SELECT id, full_name, email, password_hash FROM users WHERE email = ? LIMIT 1",
    [email],
  );
  return rows[0] ?? null;
}

export async function findUserById(id) {
  const [rows] = await pool.execute(
    "SELECT id, full_name, email FROM users WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] ?? null;
}
