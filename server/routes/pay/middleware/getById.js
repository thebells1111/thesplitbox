async function fetchSettings(storeMetadata, id) {
  return async (req, res) => {
    if (id) {
      try {
        let settings = await storeMetadata.getById(id);

        res.json(settings);
      } catch (error) {
        console.error("getById error: ", error.message);
        res.status(500).send("Internal server error");
      }
    } else {
      res.send({ status: "no id present" });
    }
  };
}

export default fetchSettings;
