import jwt from "jsonwebtoken";
import { getStore } from "./authController.js"; 

export const verifyToken = (req, res, next) => {
  // 1. Grab token from cookies (requires cookie-parser in index.js)
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "No token provided. Please log in." });
  }

  try {
    // 2. Get the secret currently stored in credentials.json
    const { jwtSecret } = getStore();
    
    // 3. Verify
    const verified = jwt.verify(token, jwtSecret);
    req.user = verified;
    next();
  } catch (err) {
    // If the server restarted and secret changed, this catch triggers
    res.status(401).json({ error: "Session expired or invalid. Please log in again." });
  }
};