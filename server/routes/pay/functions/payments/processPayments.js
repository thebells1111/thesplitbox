import sendKeysend from "./sendKeysend.js";
import sendLNUrl from "./sendLNUrl.js";

export default async function processPayments({
  accessToken,
  splits,
  metadata,
  id,
}) {
  let paymentAttempts = splits.map((recipient) => {
    console.log();
    console.log();
    console.log("r: ", recipient);
    if (recipient?.["@_type"] === "node") {
      return sendKeysend({ accessToken, recipient, metadata, id });
    } else if (recipient?.["@_type"] === "lnaddress") {
      return sendLNUrl({ accessToken, recipient, id });
    } else {
      return Promise.resolve({ status: "skipped", recipient });
    }
  });

  return Promise.all(paymentAttempts);
}
