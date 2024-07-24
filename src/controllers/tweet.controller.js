import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return new ApiError(400, "Content required");
  }

  const user = req.user._id;

  const tweet = await Tweet.create({
    content,
    owner: user,
  });

  if (!tweet) {
    throw new ApiError(401, "Error while creating tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const tweet = await Tweet.find({
    owner: userId,
  });

  if (!tweet) {
    throw new ApiError(401, "No tweets found for the user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "User's tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    return new ApiError(404, "Invalid tweet Id");
  }

  if (!content) {
    return new ApiError(404, "Content is required");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    {
      _id: tweetId,
    },
    {
      content,
    },
    {
      new: true,
    }
  );

  if (!tweet) {
    throw new ApiError(401, "Error while updating tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(401, "Invalid tweet id");
  }

  const tweet = await Tweet.findByIdAndDelete(tweetId);

  if (!tweet) {
    throw new ApiError(401, "Error while deleting tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet deleted successfully"));
});

const getAllTweets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (pageNumber < 1 || limitNumber < 1) {
    pageNumber = 1;
    limitNumber = 1;
  }

  let filter = {
    owner: req.user._id,
  };

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortType === "desc" ? -1 : 1;
  }

  const skip = (pageNumber - 1) * limitNumber;

  const tweet = await Tweet.find(filter)
    .skip(skip)
    .sort(sort)
    .limit(limitNumber);

  if (!tweet) {
    throw new ApiError(404, "No tweets found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "All tweets fetched"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet, getAllTweets };
