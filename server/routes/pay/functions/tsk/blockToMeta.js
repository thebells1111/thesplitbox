export default function blockToMeta({
  block,
  satAmount,
  comment,
  payerdata,
  nostr,
  senderName,
}) {
  const meta = {
    podcast: block?.title,
    action: "boost",
    app_name: "LNUrl Payment",
    value_msat_total: satAmount * 1000,
    message: comment,
    remoteFeedGuid: block?.feedGuid,
    remoteItemGuid: block?.itemGuid,
    eventGuid: block?.eventGuid,
    blockGuid: block?.blockGuid,
    eventAPI: block?.eventAPI,
  };

  if (payerdata?.name) {
    meta.sender_name = payerdata.name;
  }

  if (senderName) {
    meta.sender_name = senderName;
  }
  if (nostr) {
    meta.app_name = "Zap";

    // TODO: Get sender_name from nostr.pubkey lookup

    if (nostr.content) {
      meta.message = nostr.content;
    }
  }

  // Remove undefined values
  return Object.fromEntries(
    Object.entries(meta).filter(([_, v]) => v !== undefined)
  );
}
