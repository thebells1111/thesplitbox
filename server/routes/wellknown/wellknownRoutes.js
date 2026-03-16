import express from "express";

const router = express.Router();

router.get("/lnurlp/:name", (req, res) => {
  const { name } = req.params;
  
  // Dynamically get the protocol (http or https) and the host
  const protocol = req.protocol;
  const host = req.get('host');
  const domain = `${protocol}://${host}`;

  res.json({
    status: "OK",
    tag: "payRequest",
    commentAllowed: 255,
    // Dynamically inject the current domain into the callback
    callback: `${domain}/pay/${name}/callback`, 
    metadata: `[["text/identifier","${name}@${host}"],["text/plain","${name}"]]`,
    minSendable: 1000,
    maxSendable: 10000000000,
    payerData: {
      name: { mandatory: false },
      email: { mandatory: false },
      pubkey: { mandatory: false },
    },
    nostrPubkey:
      "4484c8d3dfcefab6cd348d2ff05f50873d5a59811c141f9f3b1b227ddef143df",
    allowsNostr: true,
  });
});

const wellknownRoutes = router;
export default wellknownRoutes;