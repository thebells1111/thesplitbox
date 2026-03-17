import axios from "axios";

export default async function sendKeysend({
  accessToken,
  recipient,
  metadata,
  id,
}) {
  if (!accessToken) throw new Error("Missing access token.");
  if (!recipient?.["@_address"]) throw new Error("Missing recipient address.");
  if (typeof recipient.amount !== "number" || recipient.amount < 0)
    throw new Error("Invalid recipient amount.");
  if (!process.env.WEBHOOK_SERVER)
    throw new Error("Missing WEBHOOK_SERVER environment variable.");

  const record = {
    destination: recipient["@_address"],
    amount: recipient.amount,
  };

  const customRecords = {
    7629169: JSON.stringify({
      ...metadata,
      metadataUrl: `${process.env.WEBHOOK_SERVER}/metadata/${id}`,
      name: recipient["@_name"] || "",
      value_msat: recipient.amount * 1000,
    }),
  };

  if (recipient["@_customKey"]) {
    customRecords[recipient["@_customKey"]] = recipient["@_customValue"];
  }

  if (Object.keys(customRecords).length > 0) {
    record.custom_records = customRecords;
  }

  try {
    let paymentData;
    if (recipient.amount > 0) {
      const paymentRes = await axios.post(
        "https://api.getalby.com/payments/keysend",
        record,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      paymentData = paymentRes.data;
    } else {
      paymentData = { amount: 0, status: "No sats sent. Amount too low." };
    }

    return {
      success: true,
      recipient: minimalRecipient(recipient),
      paymentData,
    };
  } catch (error) {
    if (error.response) {
      const statusCode = error.response.status;
      const isServerError = statusCode >= 500;
      const isClientError = statusCode >= 400 && statusCode < 500;

      console.error(`Keysend Payment Error: ${statusCode}`);
      console.error(
        `Problem appears on: ${
          isServerError ? "Alby's end" : isClientError ? "Your end" : "Unknown"
        }`
      );

      return {
        success: false,
        recipient: minimalRecipient(recipient),
        statusCode,
        errorSource: isServerError
          ? "server"
          : isClientError
          ? "client"
          : "unknown",
        errorType: "network",
      };
    } else {
      console.error("Internal Code Error:", error.message || error);
      return {
        success: false,
        recipient: minimalRecipient(recipient),
        errorType: "internal",
        errorMessage: error.message || "Unknown internal error",
      };
    }
  }
}

function minimalRecipient(recipient) {
  return {
    address: recipient["@_address"],
    name: recipient["@_name"] || null,
  };
}
