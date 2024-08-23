import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  const user = req.user;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError("Tweet is empty, must enter anything!", 400);
  }

  const tweet = await Tweet.create({
    owner: user._id,
    content,
  });

  res
    .status(200)
    .json(new ApiResponse(200, tweet, "Created tweet Successfully!"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { newContent } = req.body;

  if (!newContent?.trim()) {
    throw new ApiError("Must enter anything to update Twwet!", 400);
  }

   // Validate tweetId
   if (!isValidObjectId(tweetId)) {
    throw new ApiError("Invalid Tweet ID", 400);
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      content: newContent,
    },
    {
      new: true,
    }
  );

  res
  .status(200)
  .json(new ApiResponse(200, updatedTweet, "Updated tweet Successfully!"));

});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
   await Tweet.findByIdAndDelete(tweetId);
  res
  .status(200)
  .json(new ApiResponse(200, {}, "Tweet Deleted Successfully!"));
});

export { createTweet, updateTweet, deleteTweet };
