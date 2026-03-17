import queryindex from "./queryIndex.js";

export default async function fetchItem({ feedGuid, itemGuid }) {
  if (itemGuid) {
    let itemResponse = await queryindex(
      `episodes/byguid?podcastguid=${feedGuid}&guid=${itemGuid}`
    );
    return itemResponse?.episode;
  }
}
