import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const user = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return new ApiError(404, "Video not found!");
  }

  const existingVideoLike = await Like.findOne({
    likedBy: user,
    video: videoId,
  });

  if (existingVideoLike) {
    const like = await Like.findByIdAndDelete(existingVideoLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, like, "Like removed successfully"));
  } else {
    const like = await Like.create({
      likedBy: user,
      video: videoId,
    });

    const createdLike = await Like.findById(like._id).select("-comment -tweet");

    if (!createdLike) {
      throw new ApiError(500, "Something went wrong while registering the user");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, createdLike, "Like added successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const user = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return new ApiError(404, "Comment not found");
  }

  const existingCommentLike = await Like.findOne({
    likedBy: user,
    comment: commentId,
  });

  if (existingCommentLike) {
    const like = await Like.findByIdAndDelete(existingCommentLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, like, "Like removed successfully"));
  } else {
    const like = await Like.create({
      likedBy: user,
      comment: commentId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, like, "Like added successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const user = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    return new ApiError(404, "Tweet not found");
  }

  const existingTweetLike = await Like.findOne({
    likedBy: user,
    tweet: tweetId,
  });

  if (existingTweetLike) {
    const like = await Like.findByIdAndDelete(existingTweetLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, like, "Like removed successfully"));
  } else {
    const like = await Like.create({
      likedBy: user,
      tweet: tweetId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, like, "Like added successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const user = req.user._id;

  const video = await Like.find({
    likedBy: user,
  }).populate("video");

  if (!video || video.length === 0) {
    throw new ApiError(404, "No liked video found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Liked video fetched successfully")
    );
});

const getVideoLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return new ApiError(404, "Video not found");
  }

  const videoLikes = await Like.find({
    video: videoId,
  }).countDocuments();


  if (!videoLikes || videoLikes.length === 0) {
    throw new ApiError(404, "No likes found for the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoLikes, "Video likes fetched successfully"));
});

const getCommentLikes = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return new ApiError(404, "No comment found");
  }

  const commentLikes = await Like.find({
    comment: commentId,
  }).countDocuments();

  console.log(commentLikes);

  if (!commentLikes || commentLikes === 0) {
    throw new ApiError(404, "No likes found for the comment");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, commentLikes, "Comment likes fetched successfully")
    );
});

const getTweetLikes = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(404, "No tweet found");
  }

  const tweetLikes = await Like.find({
    tweet: tweetId,
  }).countDocuments();

  console.log(tweetLikes);

  if (!tweetLikes || tweetLikes === 0) {
    throw new ApiError(404, "No likes found for the comment");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, tweetLikes, "Comment likes fetched successfully")
    );
});

export {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
  getVideoLikes,
  getCommentLikes,
  getTweetLikes,
};
