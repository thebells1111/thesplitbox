import { parse } from "fast-xml-parser";
const parserOptions = {
  attributeNamePrefix: "@_",
  ignoreAttributes: false,
  ignoreNameSpace: false,
};

export default async function fetchFeed(feedUrl) {
  let res = await fetch(feedUrl);
  let data = await res.text();
  let xml2Json = parse(data, parserOptions);
  let feed = xml2Json.rss.channel;

  return feed;
}
