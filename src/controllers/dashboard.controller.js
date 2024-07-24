import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const totalVideos = await Video.countDocuments({
    owner: channelId,
  });

  const totalSubscribers = await Subscription.countDocuments({
    owner: channelId,
  });

  const totalViews = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $match: {
        views: { $gt: 0 },
      },
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
      },
    },
    {
      $project: {
        _id: 0,
        totalViews: 1,
      },
    },
  ]);

  const totalLikes = await Like.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $unwind: "$videoDetails",
    },
    {
      $match: {
        "videoDetails.owner": new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: null,
        totalVideoLikes: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalVideoLikes: 1,
      },
    },
  ]);

  const totalVideosViews = totalViews.length > 0 ? totalViews[0].totalViews : 0;
  const totalVideosLikes = totalLikes[0];

  const channelStats = [
    { totalSubscribers: totalSubscribers },
    { totalVideos: totalVideos },
    { totalVideosViews: totalVideosViews },
    { totalVideosLikes: totalVideosLikes },
  ];

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelStats,
        "Channel stats are fetched successfully"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  let { page = 1, limit = 10 } = req.query;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(404, "Invalid channel ID");
  }

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  const pipeline = [
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ];

  const videos = await Video.aggregate(pipeline);
  const totalVideos = await Video.countDocuments({
    owner: channelId,
  });

  const channelVideos = [
    { videos: videos },
    { page: page },
    { limit: limit },
    { totalVideos: totalVideos },
  ];

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelVideos, "Channel videos fetched successfully")
    );
});

export { getChannelStats, getChannelVideos };
