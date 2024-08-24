import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import mongoose, { isValidObjectId } from "mongoose";

// Whenever there is a button in UI "toggle controller" is written b/c one time it will create object, other time it will delete object from database e.g like button, subscribe button

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const user = req.user;

  const videoIsLiked = await Like.findOne({
    video: videoId,
  });

  if (videoIsLiked) {
    await videoIsLiked.deleteOne(); //unliking video
  } else {
    await Like.create({
      likedBy: user._id,
      video: videoId,
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Toggling like on Video Successfully!"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const user = req.user;

  const commentIsLiked = await Like.findOne({
    comment: commentId,
  });

  if (commentIsLiked) {
    await commentIsLiked.deleteOne();  //unliking comment
  } else {
    await Like.create({
      likedBy: user._id,
      comment: commentId,
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Toggling like on Comment Successfully!"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const user = req.user;

  const tweetIsLiked = await Like.findOne({
    tweet: tweetId,
  });

  if (tweetIsLiked) {
    await tweetIsLiked.deleteOne();  //unliking tweet
  } else {
    await Like.create({
      likedBy: user._id,
      tweet: tweetId,
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Toggling like on Tweet Successfully!"));
});

const getAllUserLikedVideos = asyncHandler(async (req, res) => {
  const user = req.user;
  
  // Validate user._id
  if (!isValidObjectId(user._id)) {
    throw new ApiError("Invalid User ID", 400);
  }

  const allUserLikedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(user._id),
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allUserLikedVideos,
        "Successfully fetched all videos liked by User!"
      )
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike,  getAllUserLikedVideos };
