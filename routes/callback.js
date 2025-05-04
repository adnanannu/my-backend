import express from 'express';
import axios from 'axios';
import qs from 'qs';

const app = express();
const port = 8080; // Make sure this matches your local development port

// OAuth credentials from Zoom
const clientId = process.env.ZOOM_CLIENT_ID;   // Set your Zoom Client ID
const clientSecret = process.env.ZOOM_CLIENT_SECRET;  // Set your Zoom Client Secret
const redirectUri = process.env.ZOOM_REDIRECT_URI;  // The URL where Zoom will redirect after user authorization

// Define the callback route
app.get('/api/v1/zoom/callback', async (req, res) => {
  const code = req.query.code; // Zoom sends the authorization code as a query parameter

  if (!code) {
    return res.status(400).json({ success: false, message: 'Authorization code is missing' });
  }

  try {
    // Exchange the authorization code for an access token
    const response = await axios.post(
      'https://zoom.us/oauth/token',
      qs.stringify({
        grant_type: 'authorization_code',
        code: code, 
        redirect_uri: redirectUri, // Ensure this matches the redirect URI configured in Zoom App
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(clientId + ':' + clientSecret).toString('base64')}`,
        },
      }
    );

    // Store the access token securely
    const accessToken = response.data.access_token;
    console.log('Access Token:', accessToken);

    // Optionally, store this access token in your database or session for further API calls

    // Respond to the user or redirect them to a success page
    res.redirect(`/success?access_token=${accessToken}`);

  } catch (error) {
    console.error("Error exchanging code for access token:", error);
    res.status(500).json({ success: false, message: 'Failed to exchange code for access token' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
