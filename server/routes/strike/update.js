import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

let data = JSON.stringify({
  webhookUrl: "https://thesplitbox.com/strike/webhook-test",
  webhookVersion: "v1",
  secret: "testtesttest",
  enabled: true,
  eventTypes: [
    "invoice.created",
    "invoice.updated",
    "payment-method.bank.created",
    "payment-method.bank.updated",
    "payout.created",
    "payout.updated",
    "payout-originator.created",
    "payout-originator.updated",
    "currency-exchange-quote.updated",
    "payment.created",
    "payment.updated",
    "deposit.updated",
    "receive-request.receive-pending",
    "receive-request.receive-completed",
  ],
});

process.env.STRIKE_WEBHOOK_TOKEN =
  "7BBE9C25B145B6BFA7B2B96B2BDFF9417AF67C493E88503013CCC92D70D21D30";
let subscriptionId = "01943288-e456-77e8-968e-3873f86443f5";
let config = {
  method: "patch",
  url: `https://api.strike.me/v1/subscriptions/${subscriptionId}`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${process.env.STRIKE_WEBHOOK_TOKEN}`,
  },
  data: data,
};

axios(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    if (error.response) {
      // Server responded with a status outside 2xx
      console.error("Error response:", error.response.data);
    } else if (error.request) {
      // No response received
      console.error("Error request:", error.request);
    } else {
      // Error setting up request
      console.error("Error message:", error.message);
    }
  });
