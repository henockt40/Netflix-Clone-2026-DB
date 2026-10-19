import mysql from "mysql2/promise";

const useSSL = process.env.DB_SSL === "true";

const ca = process.env.DB_SSL_CA_BASE64
  ? Buffer.from(
      process.env.DB_SSL_CA_BASE64,
      "base64",
    ).toString("utf8")
  : undefined;

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database:
    process.env.DB_NAME || "netflix_clone_2026",

  ssl: useSSL
    ? {
        ca,
        rejectUnauthorized: true,
      }
    : undefined,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
