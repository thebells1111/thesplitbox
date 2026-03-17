import fetchChannelFromIndex from "./fetchChannelFromIndex.js";
import fetchItemFromIndex from "./fetchItemFromIndex.js";
import fetchRSSFeed from "./fetchRSSFeed.js";
import normalizeSplits from "./normalizeSplits.js";
import findVTS from "./findVTS.js";
import getItemFromRSS from "./getItemFromRSS.js";
import combineSplits from "./combineSplits.js";

export default async function getSplits({ metadata, eventGuid, blockGuid }) {
  let debug = false;
  let splits = [];

  let destinations = { mainSplits: [], remoteSplits: [] };
  let channel;
  let remoteChannel;
  let RSS;
  let remoteRSS;
  let itemFromRSS;
  let itemFromRemoteRSS;
  let item;
  let VTS;
  let remoteItemFromRSS;
  let remoteItemFromIndex;
  let remotePercentage = 0;

  if (metadata?.guid) {
    const channelResponse = await fetchChannelFromIndex({
      guid: metadata.guid,
    });
    channel = channelResponse?.feed;
    RSS = await fetchRSSFeed(channel.url);

    if (metadata.episode_guid) {
      // const item = await fetchItemFromIndex({
      //   feedGuid: metadata.guid,
      //   itemGuid: metadata.episode_guid,
      // });

      itemFromRSS = getItemFromRSS(RSS, metadata);

      VTS = findVTS(
        itemFromRSS?.["podcast:value"]?.["podcast:valueTimeSplit"],
        metadata.ts
      );

      if (VTS) {
        remotePercentage = Number(VTS["@_remotePercentage"]) || null;
        const remoteChannelResponse = await fetchChannelFromIndex({
          guid:
            VTS?.["podcast:remoteItem"]["@_feedGuid"] ||
            metadata?.remote_feed_guid,
        });
        remoteChannel = remoteChannelResponse?.feed;
        remoteRSS = await fetchRSSFeed(remoteChannel?.url);
        itemFromRemoteRSS = getItemFromRSS(remoteRSS, {
          item_guid: VTS?.["podcast:remoteItem"]?.["@_itemGuid"],
        });

        // remoteItemFromIndex = await fetchItemFromIndex({
        //   feedGuid:
        //     VTS?.["podcast:remoteItem"]?.["@_feedGuid"] || metadata?.remote_feed_guid,
        //   itemGuid:
        //     VTS?.["podcast:remoteItem"]?.["@_itemGuid"] || metadata?.remote_item_guid,
        // });

        destinations.remoteSplits = normalizeSplits(
          itemFromRemoteRSS?.["podcast:value"]?.["podcast:valueRecipient"] ||
            remoteRSS?.["podcast:value"]?.["podcast:valueRecipient"],
          remotePercentage
        );
      } else {
        destinations.remoteSplits = normalizeSplits([], remotePercentage);
      }

      let mainPercentage = 100 - remotePercentage;
      destinations.mainSplits = normalizeSplits(
        itemFromRSS?.["podcast:value"]?.["podcast:valueRecipient"] ||
          RSS?.["podcast:value"]?.["podcast:valueRecipient"],
        mainPercentage
      );

      splits = combineSplits(destinations, metadata.value_msat_total / 1000);
    } else {
      splits = [];
    }
  }

  if (debug) {
    return {
      RSS,
      remoteRSS,
      channel,
      remoteChannel,
      item,
      itemFromRSS,
      itemFromRemoteRSS,
      splits,
      destinations,
      metadata,
      VTS,
      remoteItemFromIndex,
      remoteItemFromRSS,
    };
  } else {
    return splits;
  }
}
