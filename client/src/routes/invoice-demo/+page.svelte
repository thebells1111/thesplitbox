<script>
  import QRCode from "qrcode";
  import { onMount } from "svelte";
  import { remoteServer } from "$lib/state.svelte.js";

  import tlv from "./tlv.js";

  let recipient = { lnaddress: "steven@getalby.com", amount: 100 };
  let boostagram = "Boost";
  let invoice = "";
  let qrCodeCanvas;

  async function getInvoice() {
    try {
      tlv.value_msat_total = recipient.amount * 1000;
      const payload = {
        type: "bitcoin-lightning",
        metadata: tlv,
      };
      let res = await fetch(
        `${remoteServer}/pay/invoice?address=${recipient.lnaddress}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      console.log(data);
      generateQRCode(data.invoice);
    } catch (error) {
      console.log(error);
    }
  }

  async function generateQRCode(code) {
    if (!qrCodeCanvas) {
      return;
    }
    try {
      await QRCode.toCanvas(qrCodeCanvas, code, {
        width: 200,
      });
      invoice = code;
    } catch (err) {
      console.error(err);
    }
  }

  async function copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Invoice copied to clipboard");
      })
      .catch((err) => {
        alert("Error copying ID to clipboard");
      });
  }
</script>

<main>
  <a href="/">Back</a>
  <h1>Split Box Invoice Demo</h1>

  <div class="recipient">
    <label for="control-lnaddress">Lightning Address:</label>
    <input
      id="control-lnaddress"
      type="text"
      bind:value={recipient.lnaddress}
      placeholder="Enter Lightning Address"
      required
    />

    <label for="boost-amount">Amount (sats):</label>
    <input
      id="boost-amount"
      type="number"
      bind:value={recipient.amount}
      placeholder="Enter Amount in sats"
      required
    />
  </div>
  <button type="button" on:click={getInvoice}>Get Invoice</button>

  <div class:show={invoice} class="qr-container">
    <canvas bind:this={qrCodeCanvas}></canvas>
    <p>{invoice}</p>
    <button class="copy-qr" on:click={copyToClipboard.bind(this, invoice)}>
      Copy
    </button>
  </div>
</main>

<style>
  .recipient {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
  }

  input {
    width: 200px;
    margin-bottom: 1rem;
  }

  button {
    margin-top: 1rem;
  }

  .qr-container {
    flex-direction: column;
    align-items: center;
    width: calc(100% - 16px);
    margin: 0 8px;
    height: 100%;
    position: relative;
    display: none;
  }

  .qr-container.show {
    display: flex;
  }

  p {
    word-break: break-all;
  }
</style>
