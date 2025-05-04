import axios from "axios";
import qs from "qs";
import { User } from "../models/user.model.js";

// Initiate Zoom OAuth flow
export const initiateZoomOAuth = (req, res) => {
  const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.ZOOM_CLIENT_ID}&redirect_uri=${process.env.ZOOM_REDIRECT_URL}`;
  res.json({ authUrl });
};  
// Handle Zoom OAuth callback
export const handleZoomCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ success: false, message: "Authorization code is missing" });
  }

  try {
    // Exchange authorization code for access token
    const response = await axios.post(
      "https://zoom.us/oauth/token",
      qs.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.ZOOM_REDIRECT_URL,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // Save tokens to the user's document in the database
    const userId = req.id; // Use req.id instead of req.user.id
    await User.findByIdAndUpdate(userId, {
      zoomAccessToken: access_token,
      zoomRefreshToken: refresh_token,
      zoomTokenExpiry: Date.now() + expires_in * 1000,
    });

    res.redirect(`${process.env.CLIENT_URL}/zoom-success`);
  } catch (error) {
    console.error("Error exchanging code for access token:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to exchange code for access token" });
  }
};
// Schedule a Zoom meeting
export const scheduleZoomMeeting = async (req, res) => {
  try {
    const { hostEmail, topic, startTime, duration } = req.body;

    if (!hostEmail || !topic || !startTime || !duration) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: hostEmail, topic, startTime, duration.",
      });
    }

    // Fetch the user's Zoom access token from the database
    const user = await User.findOne({ email: hostEmail });
    if (!user || !user.zoomAccessToken) {
      return res.status(400).json({
        success: false,
        message: "Host does not have a valid Zoom access token.",
      });
    }

    // Create a Zoom meeting
    const response = await axios.post(
      `https://api.zoom.us/v2/users/${hostEmail}/meetings`,
      {
        topic,
        type: 2, // Scheduled meeting
        start_time: startTime,
        duration,
        timezone: "UTC",
      },
      {
        headers: {
          Authorization: `Bearer ${user.zoomAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      success: true,
      meeting: response.data,
    });
  } catch (error) {
    console.error("Error scheduling meeting:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to schedule Zoom meeting.",
    });
  }
};
