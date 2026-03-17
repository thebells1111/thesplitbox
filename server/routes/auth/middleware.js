import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const CRED_PATH = path.join(process.cwd(), "credentials.json");

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Accesses the cookie set in login

  if (!token) return res.status(401).json({ error: "Access denied." });

  try {
    const store = JSON.parse(fs.readFileSync(CRED_PATH, "utf-8"));
    const verified = jwt.verify(token, store.jwtSecret);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
};
