import express from "express";
import cors from "cors";
import store from "../../stores/inMemoryStore.js";

//routes
import invoice from "./middleware/invoice.js";
import webhookAsync from "./middleware/webhookAsync.js";
import saveSettings from "./middleware/saveSettings.js";
import fetchSettings from "./middleware/fetchSettings.js";
import lnurlp from "./middleware/lnurlp.js";

const storeMetadata = store;
const router = express.Router();
const corsOptions = { origin: "*" };

async function handle(fn, req, res) {
  const handler = await fn(storeMetadata);
  handler(req, res);
}

router.options("/invoice", cors(corsOptions)); // Preflight
router.post("/invoice", cors(corsOptions), (req, res) =>
  handle(invoice, req, res),
);

router.options("/webhook", cors(corsOptions)); // Preflight
router.post("/webhook", cors(corsOptions), (req, res) =>
  handle(webhookAsync, req, res),
);

router.post("/save-settings", async (req, res) =>
  handle(saveSettings, req, res),
);

router.get("/fetch-settings", async (req, res) =>
  handle(fetchSettings, req, res),
);

router.get("/metadata/:id", async (req, res) => {
  const { id } = req.params;
  let data = await storeMetadata.getById(id);
  res.json(data);
});

router.get("/lnurlp/:address/callback", cors(corsOptions), async (req, res) =>
  handle(lnurlp, req, res),
);

export default router;
