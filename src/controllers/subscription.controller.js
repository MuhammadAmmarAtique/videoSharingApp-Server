import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const subscribeChannel = asyncHandler(async (req, res) => {
  const user = req.user;
  const { channelId } = req.params;

  const subscription = await Subscription.create({
    subscriber: user._id,
    channel: channelId,
  });

  if (!subscription) {
    throw new ApiError("Problem in subscribing Chaneel!", 500);
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscription,
        "User has successfully Subscribed a Channel! "
      )
    );
});

const unsubscribeChannel = asyncHandler(async (req, res) => {
  const user = req.user;
  const { channelId } = req.params;

  const subscription = await Subscription.findOne({
    subscriber: user._id,
    channel: channelId,
  });

  if (!subscription) {
    throw new ApiError("User is already unsubscribed!", 400);
  }
  await subscription.deleteOne();

  res
    .status(200)
    .json(
      new ApiResponse(200, {}, "User has successfully unSubscribed a Channel! ")
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  res.send("work in progresss!!!");
});

export { subscribeChannel, unsubscribeChannel, getUserChannelSubscribers };
