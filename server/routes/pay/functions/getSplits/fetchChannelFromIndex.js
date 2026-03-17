import queryindex from "./queryIndex.js";

export default async function fetchChannel({ guid }) {
  if (guid) {
    console.log(guid);
    return await queryindex(`podcasts/byguid?guid=${guid}`);
  }
}
