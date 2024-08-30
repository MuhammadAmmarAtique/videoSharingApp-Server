import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";


const getChannelVideos = asyncHandler(async (req, res) => {
  const allChannelVideos = await Video.find({
    owner: new mongoose.Types.ObjectId(req.user._id),
  });

  if (allChannelVideos.length === 0) {
    throw new ApiError("Channel doesnot have any Videos!");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allChannelVideos,
        "Successfully fetched all channel Videos!"
      )
    );
});

const getChannelStats = asyncHandler(async (req, res) => {

  // 1)Total Videos
  const allChannelVideos = await Video.find({
    owner: new mongoose.Types.ObjectId(req.user._id),
  });

  // 2)Total Video Views
  let totalVideoViews = 0;
  allChannelVideos.map((video) => (totalVideoViews += video.views));

  //3) Total Video Likes
  const totalVideoLikes = await Like.find({
    video: allChannelVideos.map((video) => video._id),
  });

  // 4)Total Subcribers
  const totalSubscribers = await Subscription.find({
    channel : req.user._id
  })

  res.status(200).json(
    new ApiResponse(
      200,
      {
        "Total videos": allChannelVideos.length,
        "Total Video Views": totalVideoViews,
        "Total Video Likes": totalVideoLikes.length,
        "Total Subscribers": totalSubscribers.length,
      },
      "Successfully fetched all Channel Stats!"
    )
  );
});

export { getChannelVideos, getChannelStats };
