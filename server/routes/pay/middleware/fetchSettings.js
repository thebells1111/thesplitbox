import getAddressFromCookies from "../functions/settings/getAddressFromCookies.js";

async function fetchSettings(storeMetadata) {
  return async (req, res) => {
    let address = await getAddressFromCookies(req);

    if (address) {
      try {
        let settings = await storeMetadata.fetchSettings(address);

        res.json(settings);
      } catch (error) {
        console.error("fetchSettings error: ", error.message);
        res.status(500).send("Internal server error");
      }
    } else {
      res.send({ loggedIn: false });
    }
  };
}

export default fetchSettings;
