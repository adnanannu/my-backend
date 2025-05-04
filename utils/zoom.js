import jwt from "jsonwebtoken";
import axios from "axios";

// Generate Zoom JWT Token
export const generateZoomToken = () => {
  const payload = {
    iss: process.env.ZOOM_API_KEY,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
  };
  return jwt.sign(payload, process.env.ZOOM_API_SECRET);
};

// Create a Zoom Meeting
export const createZoomMeeting = async (hostEmail, topic, startTime, duration) => {
  const token = generateZoomToken();
  try {
    const response = await axios.post(
      "https://api.zoom.us/v2/users/" + hostEmail + "/meetings",
      {
        topic,
        type: 2, // Scheduled meeting
        start_time: startTime,
        duration, // in minutes
        timezone: "UTC",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating Zoom meeting:", error.response.data);
    throw new Error("Failed to create Zoom meeting");
  }
};
