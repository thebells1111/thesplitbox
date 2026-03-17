import express from "express";
import { 
  createEvent, 
  getEvents, 
  updateEvent, 
  deleteEvent 
} from "./eventsController.js";
import { verifyToken } from "../auth/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

// GET /admin/events/list (or /admin/events/list?guid=...)
router.get("/list", getEvents);

// GET /admin/events/create?name=...
router.get("/create", createEvent);

// POST /admin/events/update (Body: { guid, name, blocks, valueBlock })
router.post("/update", updateEvent);

// DELETE /admin/events/delete?guid=...
router.delete("/delete", deleteEvent);

export default router;