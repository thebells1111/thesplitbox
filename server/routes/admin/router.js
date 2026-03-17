import express from "express";
import { updateCredentials, listUsers } from "./controller.js";
import { verifyToken } from "../auth/middleware.js";

const router = express.Router();

// Apply the middleware to all routes in this router
router.use(verifyToken);

router.post("/update", updateCredentials);
router.get("/users", listUsers);

export default router;
