import express from "express";
import { login, updateCredentials } from "./authController.js";
import { verifyToken } from "./authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/setup", updateCredentials); // Initial admin setup

// Example of a protected route
router.post("/add-user", verifyToken, updateCredentials);

export default router;
