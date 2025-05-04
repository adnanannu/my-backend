import express from "express";
import { scheduleZoomMeeting, handleZoomCallback, initiateZoomOAuth } from "../controllers/zoom.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js"; // Import your authentication middleware

const router = express.Router();

// Schedule a Zoom meeting
router.post("/schedule", scheduleZoomMeeting);

// Initiate Zoom OAuth flow
router.get("/auth", initiateZoomOAuth);

// Handle Zoom OAuth callback (protected route)
router.get("/callback", isAuthenticated, handleZoomCallback);

export default router;
