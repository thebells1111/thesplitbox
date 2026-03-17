export default function getItemFromRSS(feed, metadata) {
  return []
    .concat(feed?.item)
    .find(
      (v) =>
        metadata?.episode_guid === v?.guid ||
        metadata?.episode_guid === v?.guid?.["#text"]
    );
}
