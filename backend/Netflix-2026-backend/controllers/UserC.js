import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail, findUserById } from "../services/UserService.js";

const toPublicUser = (record) => ({
  id: record.id,
  fullName: record.full_name,
  email: record.email,
});

function issueToken(user) {
  return jwt.sign({ sub: String(user.id) }, process.env.JWT_SECRET, {
    expiresIn: "12h", issuer: "netflix-clone-auth",
  });
}

export async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.authInput;
    const passwordHash = await bcrypt.hash(password, 12);
    let user;
    try {
      user = await createUser({ fullName, email, passwordHash });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "An account with this email already exists." });
      }
      throw error;
    }
    return res.status(201).json({ token: issueToken(user), user: toPublicUser(user) });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.authInput;
    const account = await findUserByEmail(email);
    const valid = account && await bcrypt.compare(password, account.password_hash);
    if (!valid) return res.status(401).json({ message: "Incorrect email or password." });
    return res.json({ token: issueToken(account), user: toPublicUser(account) });
  } catch (error) { next(error); }
}

export async function currentUser(req, res, next) {
  try {
    const account = await findUserById(req.authUserId);
    if (!account) return res.status(401).json({ message: "Account no longer exists." });
    return res.json({ user: toPublicUser(account) });
  } catch (error) { next(error); }
}
