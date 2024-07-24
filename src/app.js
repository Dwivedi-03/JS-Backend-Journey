import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

// Import Routes
import userRouter from "./routes/user.routes.js";
import comment from "./routes/comment.routes.js";
import dashboard from "./routes/dashboard.routes.js";
import healthCheck from "./routes/healthCheck.routes.js";
import like from "./routes/like.routes.js";
import playlist from "./routes/playlist.routes.js";
import subscription from "./routes/subscription.routes.js";
import tweet from "./routes/tweet.routes.js";
import video from "./routes/video.routes.js";

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/healthCheck", healthCheck);
app.use("/api/v1/comment", comment);
app.use("/api/v1/dashboard", dashboard);
app.use("/api/v1/like", like);
app.use("/api/v1/playlist", playlist);
app.use("/api/v1/subscription", subscription);
app.use("/api/v1/tweet", tweet);
app.use("/api/v1/video", video);

// URL : http://localhost:8000/api/v1/users/register
// URL : http://localhost:8000/api/v1/users/login
export { app };
