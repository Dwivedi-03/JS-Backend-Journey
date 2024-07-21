import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Comment } from "../models/comment.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return new ApiError(400, "Invalid video ID");
  }

  const skip = (page - 1) * limit;
  const comments = await Comment.find({ video: videoId })
    .skip(skip)
    .limit(parseInt(limit))
    .exec();

  if (!comments?.length) {
    return new ApiError(404, "No comments found for video with id ", videoId);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "All comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return new ApiError(400, "Invalid video ID");
  }

  if (!content) {
    return new ApiError(400, "Content is required");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
  });

  if (!comment) {
    throw new ApiError(401, "Error while creating comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return new ApiError(400, "Invalid comment ID");
  }

  if (!content) {
    return new ApiError(400, "Content is required");
  }

  const comment = await Comment.findByIdAndUpdate(commentId, {
    content,
  });

  if (!comment) {
    return new ApiError(401, "Error while updating comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment Updated Successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return new ApiError(400, "Invalid Comment ID");
  }

  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) {
    return new ApiError(404, "Comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
