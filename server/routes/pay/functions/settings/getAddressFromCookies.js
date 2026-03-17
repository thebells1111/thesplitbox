import axios from "axios";
import jwt from "jsonwebtoken";

export default async function getAddressFromCookies(req) {
  try {
    const cookies = req.cookies;
    const alby = cookies.awt
      ? jwt.verify(cookies.awt, process.env.ALBY_JWT)
      : undefined;

    let resolve = await axios({
      url: "https://api.getalby.com/user/value4value",
      headers: { Authorization: `Bearer ${alby.access_token}` },
    }).catch((error) => {
      console.log("get addressError: ", error.response.data);
      return null;
    });

    let account = resolve.data;
    return account.lightning_address;
  } catch (error) {
    console.log("JWT verify error: ", error.message);
    return null;
  }
}
