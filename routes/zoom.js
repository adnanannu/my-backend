import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

let zoomAccessToken = null;
let zoomAccessTokenExpiry = 0;

// ✅ Get Zoom Access Token
async function getZoomAccessToken() {
  const now = Date.now();
  if (zoomAccessToken && now < zoomAccessTokenExpiry) {
    return zoomAccessToken;
  }

  try {
    const response = await axios.post(
      "https://zoom.us/oauth/token",
      null,
      {
        params: {
          grant_type: "account_credentials",
          account_id: process.env.ZOOM_ACCOUNT_ID,
        },
        auth: {
          username: process.env.ZOOM_CLIENT_ID,
          password: process.env.ZOOM_CLIENT_SECRET,
        },
      }
    );

    zoomAccessToken = response.data.access_token;
    zoomAccessTokenExpiry = now + response.data.expires_in * 1000;

    return zoomAccessToken;
  } catch (error) {
    console.error("Error getting Zoom access token:", error.response?.data || error);
    throw error;
  }
}

// ✅ Schedule Zoom Meeting
router.post("/schedule", async (req, res) => {
  const { topic, startTime, duration } = req.body;

  try {
    const accessToken = await getZoomAccessToken();

    const response = await axios.post(
      `https://api.zoom.us/v2/users/${process.env.ZOOM_USER_ID}/meetings`,
      {
        topic,
        type: 2,
        start_time: startTime,
        duration,
        timezone: "Asia/Dubai", // Change as needed
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error scheduling meeting:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to schedule meeting" });
  }
});

export default router;
