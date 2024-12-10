import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.middleware.js"
import express from "express";
const app = express();

app.use(
  cors({
    origin: `${process.env.CORS_ORIGIN}`,
    credentials: true, //server allows credentials to be included in cross-origin requests. Credentials can include cookies, authorization headers, or TLS client certificates.
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import healthcheckRouter from "./routes/healthcheck.route.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.route.js"
import likeRouter from "./routes/like.route.js"
import tweetRouter from "./routes/tweet.route.js"
import playlistRouter from "./routes/playlist.route.js"
import subscriptionRouter from "./routes/subscription.route.js"
import dashboardRouter from "./routes/dashboard.route.js"

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
// http://localhost:7000/api/v1/users/register
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// errorHandler Middleware
app.use(errorHandler)

export default app;
