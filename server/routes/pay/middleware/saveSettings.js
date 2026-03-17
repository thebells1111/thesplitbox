import getAddressFromCookies from "../functions/settings/getAddressFromCookies.js";
function saveSettings(storeMetadata) {
  return async (req, res) => {
    const settings = req.body;
    let address = await getAddressFromCookies(req);
    if (address) {
      try {
        await storeMetadata.saveSettings(address, settings);

        res.json({ status: "saved" });
      } catch (error) {
        console.error("saveSettings error: ", error.message);
        res.status(500).send("Internal server error");
      }
    } else {
      res.send({ loggedIn: false });
    }
  };
}

export default saveSettings;
