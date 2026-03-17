export default async function getInvoice(address, amount, comment) {
  const [name, server] = address.split("@");
  const paymentUrl = `https://${server}/.well-known/lnurlp/${name}`;

  try {
    const res = await fetch(paymentUrl);
    const data = await res.json();

    if (!data.callback) {
      throw new Error("Callback URL missing in LNURLP response");
    }

    const invoiceRes = await fetch(
      `${data.callback}?amount=${amount}${comment ? `&comment=${comment}` : ""}`
    );
    const invoiceData = await invoiceRes.json();
    return invoiceData.pr;
  } catch (error) {
    return { success: false };
  }
}
