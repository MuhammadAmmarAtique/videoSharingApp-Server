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
    channel: channelId,
    subscriber: user._id,
  });

  let result;
  if (!subscription) {
    await Subscription.create({
      // whever any User will subscribe a channel subscription object will be created
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
  const aggregationPipeline = await Subscription.aggregate([
    {
      $match: {
        //using channel-field we are getting subscribers
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        // here we are getting subscribers detail based on subscriber id
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
      },
    },
    {
      $addFields: {
        subscriber: { $arrayElemAt: ["$subscriber", 0] },
      },
    },
    {
      $project: {
        subscriber: 1,
      },
    },
  ]);

  if (aggregationPipeline.length === 0) {
    throw new ApiError("This Channel has no subscribers!", 400);
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        aggregationPipeline,
        "Successfully fetched subscribers list of channel!"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});

// *** After completed making above  3 controller i.e toggleSubscription, getUserChannelSubscribers, getSubscribedChannels
//  WORK ON MAIKING getUserPlaylist() controller like getUserWatchHistroy()

export { toggleSubscription, getUserChannelSubscribers };
