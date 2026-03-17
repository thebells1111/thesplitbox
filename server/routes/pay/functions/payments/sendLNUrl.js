import axios from "axios";
import dotenv from "dotenv";

if (!process.env.WEBHOOK_SERVER) {
  dotenv.config();
}

export default function sendLNUrl({ accessToken, recipient, id }) {
  return new Promise(async (resolve, reject) => {
    try {
      const [name, server] = recipient["@_address"].split("@");
      const paymentUrl = `https://${server}/.well-known/lnurlp/${name}`;

      const res = await fetch(paymentUrl);
      const data = await res.json();

      if (!data.callback) {
        throw new Error("Callback URL missing in LNURLP response");
      }
      console.log(
        `${data.callback}?amount=${
          recipient.amount * 1000
        }&comment=${`${process.env.WEBHOOK_SERVER}/metadata/${id}`}`
      );
      const invoiceRes = await fetch(
        `${data.callback}?amount=${
          recipient.amount * 1000
        }&comment=${`${process.env.WEBHOOK_SERVER}/metadata/${id}`}`
      );

      const invoiceData = await invoiceRes.json();
      const invoice = invoiceData.pr;

      const paymentRes = await axios.post(
        "https://api.getalby.com/payments/bolt11",
        { invoice },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      let paymentData = paymentRes.data;
      resolve({ success: true, recipient, paymentData });
    } catch (error) {
      console.log("Payment Process Error:", error.message || error);
      resolve({ success: false, recipient });
    }
  });
}
