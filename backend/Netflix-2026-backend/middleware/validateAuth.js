import { normalizeEmail, validateAuthInput } from "../Auth/validation.js";

/** Validate and normalize auth input before calling controllers. */
export function validateAuth(registering = false) {
  return (req, res, next) => {
    const error = validateAuthInput(req.body, registering);
    if (error) return res.status(400).json({ message: error });

    req.authInput = {
      ...(registering ? { fullName: req.body.fullName.trim() } : {}),
      email: normalizeEmail(req.body.email),
      password: req.body.password,
    };
    return next();
  };
}
