import express from "express";
import { login, updateCredentials } from "./controller.js";
import { verifyToken } from "./middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/setup", updateCredentials); // Initial admin setup

// Example of a protected route
router.post("/add-user", verifyToken, updateCredentials);

export default router;
