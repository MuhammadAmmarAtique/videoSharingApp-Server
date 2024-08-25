import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose, { isValidObjectId } from "mongoose";

// Whenever there is a button in UI "toggle controller" is written b/c one time it will create object, other time it will delete object from database e.g here toggleSubscription will one time subscribe channel and other time unsubcribe channel.
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const user = req.user;

  const subscription = await Subscription.findOne({
    channel : channelId
  });
  console.log("subscription: ", subscription);

  let result;
  if (!subscription) {
     await Subscription.create({
      subscriber: user._id,
      channel: channelId,
    });
    result = "subscribed";
  } else {
     await subscription.deleteOne(); //unsubscribe
    result = "unSubscribed";
  }
  res
    .status(200)
    .json(new ApiResponse(200, {}, `Successfully ${result} channel!`));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});

// *** After completed making above  3 controller i.e toggleSubscription, getUserChannelSubscribers, getSubscribedChannels
//  WORK ON MAIKING getUserPlaylist() controller like getUserWatchHistroy()

export { toggleSubscription, getUserChannelSubscribers };
