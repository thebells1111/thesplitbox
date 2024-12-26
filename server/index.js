import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cookie from "cookie";
import cors from "cors"; // Import the CORS package

import albyRoutes from "./routes/alby/albyRoutes.js";
import splitBoxRouter from "./routes/splitbox/router.js";

const PORT = 3000; // Server port
const app = express();

dotenv.config();

// Enable CORS for localhost:5173
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
    credentials: true, // Allow credentials (cookies, headers, etc.)
  })
);

app.use(express.json()); // Parse JSON request bodies

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

app.use((req, res, next) => {
  req.cookies = cookie.parse(req.headers.cookie || "");
  next();
});

let tempTokens = {};
if (process.env.ALBY_JWT) {
  app.use("/alby", albyRoutes(tempTokens));
}

app.use("/splitbox", splitBoxRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`MetaBoost API is running on http://localhost:${PORT}`);
});
