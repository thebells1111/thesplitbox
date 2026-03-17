import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors"; // Import the CORS package

// import albyRoutes from "./routes/alby/albyRoutes.js";
import payRouter from "./routes/pay/router.js";
import authRouter from "./routes/admin/auth/authRouter.js";
import adminRouter from "./routes/admin/adminRouter.js";
import eventsRouter from "./routes/admin/events/eventsRouter.js"
import wellknownRoutes from "./routes/wellknown/wellknownRoutes.js";
// import prismRoutes from "./routes/prism/router.js";

const PORT = 3000; // Server port
const app = express();

dotenv.config();

app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  const allowedOrigins = ["http://localhost:5173"];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    }),
  );

  app.use(express.static(path.join(process.cwd(), "/server/public")));
} else {
  // Serve static files from 'public' folder
  app.use(express.static(path.join(process.cwd(), "/public")));
}

app.use(express.json()); // Parse JSON request bodies

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  }),
);



app.use("/.well-known", cors({ origin: "*" }), wellknownRoutes);

app.use("/pay", payRouter);
app.use("/admin/auth", authRouter);
app.use("/admin/events", eventsRouter);
app.use("/admin", adminRouter); 



// Start the server
app.listen(PORT, () => {
  console.log(`The Split Box is running on http://localhost:${PORT}`);
});
