import express from "express";
import { updateCredentials, listUsers } from "./adminController.js";
import { verifyToken } from "./auth/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/update", updateCredentials);
router.get("/users", listUsers);

export default router;