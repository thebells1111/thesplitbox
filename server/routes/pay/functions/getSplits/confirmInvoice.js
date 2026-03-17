import crypto from "crypto";
import { decode } from "bolt11";

export default function confirmInvoice(preimage, invoice) {
  try {
    // Ensure preimage is a Buffer (or handle string conversion)
    const preimageBuffer = Buffer.isBuffer(preimage)
      ? preimage
      : Buffer.from(preimage, "hex");

    // Decode the BOLT11 invoice
    const decodedInvoice = decode(invoice);

    // Extract payment_hash from tags array
    const paymentHashTag = decodedInvoice.tags.find(
      (tag) => tag.tagName === "payment_hash"
    );
    if (!paymentHashTag) {
      console.error("Payment hash is missing from decoded invoice.");
      return;
    }

    const paymentHashFromInvoice = Buffer.from(paymentHashTag.data, "hex");

    // Hash the preimage using SHA256 to get the payment_hash
    const paymentHashFromPreimage = crypto
      .createHash("sha256")
      .update(preimageBuffer)
      .digest();

    // Compare the hashes
    if (paymentHashFromInvoice.equals(paymentHashFromPreimage)) {
      return true;
    }
  } catch (error) {
    console.error("Error decoding the invoice:", error.message);
  }
}
