import confirmInvoice from "../functions/getSplits/confirmInvoice.js";
import getSplits from "../functions/getSplits/getSplits.js";
import processPayments from "../functions/payments/processPayments.js";
import blockToMeta from "../functions/tsk/blockToMeta.js";
import clone from "just-clone";
import { Webhook } from "svix";
import dotenv from "dotenv";
import { io } from "socket.io-client";
import { sendZapReceipt } from "../functions/nostr/sendZapRequest.js";

if (!process.env.WEBHOOK) {
  dotenv.config();
}

function webhookAsync(storeMetadata) {
  return async (req, res) => {
    const payload = req.body;
    const headers = req.headers;
    res.status(200).send("Webhook received");
    try {
      // Verify the signature
      const wh = new Webhook(process.env.WEBHOOK);
      const verifiedPayload = await wh.verify(JSON.stringify(payload), headers);
      console.log();
      console.log("*********************************************");
      console.log("              incoming webhook               ");
      console.log("*********************************************");
      console.log("verifiedPayload: ", verifiedPayload);
      if (verifiedPayload) {
        if (payload.payment_request) {
          const preimage = payload.preimage || payload.payment_preimage;
          const invoice = payload.payment_request;
          const amount = payload.amount || 0;
          let runningAmount = amount;

          if (confirmInvoice(preimage, invoice)) {
            await storeMetadata.updateByInvoice(invoice, { settled: true });

            const storedData = await storeMetadata.getByInvoice(invoice);

            let {
              eventGuid,
              blockGuid,
              value,
              comment,
              metadata,
              id,
              parentAddress,
              payerdata,
              nostr,
              senderName,
            } = storedData;

            console.log("has nostr: ", nostr ? "true" : "false");
            console.log("eventGuid: ", eventGuid);

            if (nostr) {
              const { event, sender } = await sendZapReceipt({
                zapRequest: nostr,
                bolt11: invoice,
                paidAt: Math.floor(Date.now() / 1000),
                nsec: process.env.NSEC,
                preimage: null,
                timeoutMs: 5000, // Use a shorter timeout for testing
              });

              senderName =
                sender?.display_name || sender?.name || "Anonymous Zapper";
            }

            const url = `https://api.thesplitkit.com/event?event_id=${eventGuid}`;
            try {
              await new Promise((resolve, reject) => {
                console.log(url);
                const socket = io(url, { transports: ["websocket"] });
                console.log(socket);

                socket.on("connect", () => {
                  socket.emit("webhookInvoice", { eventGuid, invoice });
                  socket.disconnect();
                  resolve(); // keep alive long enough to emit
                });

                socket.on("connect_error", (err) => {
                  console.log("Socket connection error:", err);
                  resolve(); // resolve anyway; you don't want to block the rest
                });
              });
            } catch (err) {
              console.log("Unhandled socket error:", err);
            }

            if (blockGuid) {
              let event = await getEvent(eventGuid);
              let block = getBlock(event, blockGuid);

              let account = await storeMetadata.fetchAccessToken(
                parentAddress || "thesplitbox@getalby.com",
              );

              //this adds an '@_' to each destination so it matches parsed RSS feeds
              let splits = []
                .concat(value?.destinations)
                .filter(Boolean)
                .map((obj) =>
                  Object.fromEntries(
                    Object.entries(obj).map(([key, value]) => [
                      key.startsWith("@_") ? key : `@_${key}`,
                      value,
                    ]),
                  ),
                );

              let feesDestinations = [];
              let splitsDestinations = [];

              splits.forEach((v) => {
                if (!v["@_fee"] || v["@_fee"] === false) {
                  splitsDestinations.push(clone(v));
                } else {
                  feesDestinations.push(clone(v));
                }
              });

              feesDestinations.forEach((fee) => {
                fee.amount = Math.floor((fee["@_split"] / 100) * amount);
                runningAmount -= fee.amount;
              });

              splitsDestinations.forEach((split) => {
                split.amount = Math.floor(
                  (split["@_split"] / 100) * runningAmount,
                );
              });

              let completedPayments = await processPayments({
                accessToken: account.albyAccessToken,
                splits: [...feesDestinations, ...splitsDestinations],
                metadata: blockToMeta({
                  block,
                  satAmount: payload.amount,
                  comment,
                  payerdata,
                  nostr,
                  senderName,
                }),
                id,
              });
              await storeMetadata.updateByInvoice(invoice, {
                completedPayments,
              });
            } else if (metadata) {
              let splits = await getSplits(metadata);
              let account = await storeMetadata.fetchAccessToken(
                parentAddress || "thesplitbox@getalby.com",
              );
              let completedPayments = await processPayments({
                accessToken: account.albyAccessToken,
                splits,
                metadata,
                id,
              });
              await storeMetadata.updateByInvoice(invoice, {
                completedPayments,
              });
            }
          }
        } else {
          console.log({ success: false, reason: "unconfirmed preimage" });
        }
      }
      console.log("Webhook verified");
    } catch (error) {
      console.error(error.message);
      return;
    }
  };
}

export default webhookAsync;

async function getEvent(guid) {
  const url = `https://curiohoster.com/api/sk/getblocks?guid=${guid}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

function getBlock(event, guid) {
  return (event?.blocks || []).find((v) => v.blockGuid === guid);
}
