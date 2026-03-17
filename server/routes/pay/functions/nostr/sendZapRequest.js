import { getEventHash, validateEvent } from "nostr-tools";
import * as nip19 from "nostr-tools/nip19";
import { SimplePool } from "nostr-tools/pool";
import { finalizeEvent, getPublicKey } from "nostr-tools/pure";
import WebSocket from "ws";
global.WebSocket = WebSocket;

/**
 * Convert bech32 nsec to raw hex private key.
 */
function nsecToHex(nsec) {
  const { type, data } = nip19.decode(nsec);
  if (type !== "nsec") throw new Error("Invalid nsec");
  return data;
}

/**
 * Fetch Kind 0 metadata for sender.
 */
async function fetchSenderMetadata(pubkey, relays, timeoutMs = 5000) {
  const pool = new SimplePool();

  return new Promise((resolve, reject) => {
    // Add timeout to ensure the function doesn't hang indefinitely
    const timeout = setTimeout(() => {
      if (sub) sub.close();
      reject(new Error("Metadata fetch timed out"));
    }, timeoutMs);

    // Use callbacks directly instead of event emitter pattern
    const sub = pool.subscribeMany(
      relays,
      [{ kinds: [0], authors: [pubkey] }],
      {
        onevent(event) {
          clearTimeout(timeout);
          sub.close();
          try {
            const metadata = JSON.parse(event.content);
            resolve({ ...metadata, pubkey });
          } catch {
            reject(new Error("Invalid metadata JSON"));
          }
        },
        oneose() {
          clearTimeout(timeout);
          sub.close();
          reject(new Error("No metadata found"));
        },
        onclose() {
          clearTimeout(timeout);
          reject(new Error("Connection closed"));
        },
      }
    );
  });
}

/**
 * Build, sign, publish, and return a zap receipt with sender metadata.
 */
export async function sendZapReceipt({
  zapRequest,
  bolt11,
  paidAt,
  nsec,
  preimage = null,
  timeoutMs = 7000,
}) {
  const privkey = nsecToHex(nsec);
  const pubkey = getPublicKey(privkey);

  const tags = [];

  const p = zapRequest.tags.find((t) => t[0] === "p")?.[1];
  if (!p) throw new Error("Missing 'p' tag");
  tags.push(["p", p]);

  const e = zapRequest.tags.find((t) => t[0] === "e")?.[1];
  if (e) tags.push(["e", e]);

  const a = zapRequest.tags.find((t) => t[0] === "a")?.[1];
  if (a) tags.push(["a", a]);

  const senderPubkey = zapRequest.pubkey;
  if (senderPubkey) tags.push(["P", senderPubkey]);

  tags.push(["bolt11", bolt11]);
  tags.push(["description", JSON.stringify(zapRequest)]);
  if (preimage) tags.push(["preimage", preimage]);

  const event = finalizeEvent(
    {
      kind: 9735,
      pubkey,
      created_at: paidAt,
      content: "",
      tags,
    },
    privkey
  );

  if (!validateEvent(event)) throw new Error("Invalid zap receipt");

  // Extract relay information and ensure it's always an array
  const relayTag = zapRequest.tags.find((t) => t[0] === "relays");
  const relays =
    Array.isArray(relayTag) && relayTag.length > 1
      ? relayTag.slice(1)
      : [
          "wss://relay.damus.io",
          "wss://relay.snort.social",
          "wss://relay.nostr.band",
        ];

  // Make sure relays is a proper array and not some other iterable
  const relayArray = (Array.isArray(relays) ? relays : [relays]).map((r) =>
    r.replace(/\/+$/, "")
  );

  console.log(relayArray);

  const pool = new SimplePool();
  // Define a function to create a promise that will resolve after publishing
  const publishWithTimeout = async () => {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        console.log("Publication timeout reached, continuing execution");
        resolve();
      }, timeoutMs);

      try {
        // Use publishEvent and set up promises
        const pubs = pool.publish(relayArray, event);

        // When all publications are settled (either resolved or rejected), clear timeout and resolve
        Promise.allSettled(pubs).then((results) => {
          console.log(results);
          clearTimeout(timeoutId);
          const successes = results.filter(
            (r) => r.status === "fulfilled"
          ).length;
          console.log(`Published to ${successes}/${relayArray.length} relays`);
          resolve();
        });
      } catch (err) {
        console.error(`Failed to initiate publish:`, err.message);
        clearTimeout(timeoutId);
        resolve(); // Resolve anyway to continue execution
      }
    });
  };

  // Execute the publish with timeout
  await publishWithTimeout();

  let sender = null;
  if (senderPubkey) {
    try {
      // Use the same timeout for metadata fetch
      sender = await fetchSenderMetadata(
        senderPubkey,
        relayArray,
        timeoutMs
      ).catch((e) => {
        console.warn("Could not fetch sender metadata:", e.message);
        return null;
      });
    } catch (e) {
      console.warn("Error in metadata fetch:", e.message);
    }
  }

  // Try to close the pool safely
  try {
    // Some versions of nostr-tools have issues with pool.close()
    // Only call it if it exists and is a function
    if (pool && typeof pool.close === "function") {
      // Create a wrapper that catches any errors that might occur
      const safeClose = () => {
        try {
          pool.close();
        } catch (e) {
          console.warn("Error closing pool:", e.message);
        }
      };

      safeClose();
    }
  } catch (e) {
    console.warn("Error attempting to close pool:", e.message);
  }

  return { event, sender };
}
