-- Open this script in MySQL Workbench 8.0 and click the lightning-bolt icon.
-- Only the authentication users table is introduced; movie data remains on TMDB.
CREATE DATABASE IF NOT EXISTS netflix_clone_2026
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE netflix_clone_2026;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;
