import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const user = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel");
  }

  if (user === channelId) {
    throw new ApiError(400, "You can't subscribe to yourself");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: user,
    channel: channelId,
  });

  if (existingSubscription) {
    const subscribe = await Subscription.findOneAndDelete({
      subscriber: user,
      channel: channelId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, subscribe, "Subscribe removed Successfully"));
  } else {
    const subscribe = await Subscription.create({
      subscriber: user,
      channel: channelId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, subscribe, "Subscription added Successfully"));
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(404, "Invalid channel");
  }

  const user = await User.find({
    _id: channelId,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const getUserChannelSubscribers = await Subscription.find({
    channel: channelId,
  });

  if (!getUserChannelSubscribers) {
    throw new ApiError(400, "No subscribers found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getUserChannelSubscribers,
        "Channel subscribers fetched successfully"
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  try {
    const { subscriberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
      throw new ApiError(404, "Invalid subscriber id");
    }

    console.log(subscriberId);
    const subscribedChannels = await Subscription.find({
      subscriber: subscriberId,
    });

    if (!subscribedChannels || subscribedChannels.length === 0) {
      throw new ApiError(404, "No subscribed channels found");
    }
    console.log(subscribedChannels);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscribedChannels,
          "Subscribed channels fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(400, "Something went wrong || ");
  }
});

export { toggleSubscription, getSubscribedChannels, getUserChannelSubscribers };
