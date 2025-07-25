import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import zoomRoutes from "./routes/zoom.js";

dotenv.config();

// Connect to the database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'https://tutorzz.netlify.app', // ✅ Must match your frontend domain
    credentials: true,
  })
);

// ✅ Add test route to check connection
app.get('/api/test', (req, res) => {
  res.json({ message: 'Frontend and Backend Connected Successfully!' });
});

// Routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/zoom", zoomRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});



