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

dotenv.config({});

// Call database connection
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Default middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'https://tutorzz.netlify.app', // ✅ This must match your Netlify domain
  credentials: true
  })
);


// APIs
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/zoom", zoomRoutes);

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
  
});



