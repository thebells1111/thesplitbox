import dotenv from "dotenv";
import axios from "axios";
import crypto from "crypto";

// Load environment variables at the top
dotenv.config();

const { PI_API_KEY, PI_API_SECRET } = process.env;

export default async function queryIndex(query) {
  try {
    // ======== Generate the Authorization token ========
    const apiHeaderTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const sha1Hash = crypto.createHash("sha1");
    const data4Hash = PI_API_KEY + PI_API_SECRET + apiHeaderTime; // Concatenated string for hashing
    sha1Hash.update(data4Hash);
    const hash4Header = sha1Hash.digest("hex");

    // ======== Set Axios request headers ========
    const headers = {
      "X-Auth-Date": apiHeaderTime.toString(),
      "X-Auth-Key": PI_API_KEY,
      Authorization: hash4Header,
      "User-Agent": "CurioHoster",
    };

    const baseUrl = "https://api.podcastindex.org/api/1.0/";
    const url = baseUrl + query;

    const response = await axios.get(url, { headers: headers });

    // Check for a successful response
    if (response && response.data) {
      return response.data;
    } else {
      return []; // Empty array if no valid response data
    }
  } catch (err) {
    console.error("queryIndex error:", err); // Log full error object
    return [];
  }
}
