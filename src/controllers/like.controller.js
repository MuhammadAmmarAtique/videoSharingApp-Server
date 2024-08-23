import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const user = req.user;

  const videoIsLiked = await Like.findOne({
    video: videoId,
  });

  if (videoIsLiked) {
    await videoIsLiked.deleteOne();
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
    await commentIsLiked.deleteOne();
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

export { toggleVideoLike, toggleCommentLike, getAllUserLikedVideos };
