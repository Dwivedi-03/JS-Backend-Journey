import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
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

  const videos = await Video.find(filter)
    .skip(skip)
    .sort(sort)
    .limit(limitNumber);

  if (!videos) {
    throw new ApiError(401, "No video found for this search");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "All videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    const videoFileLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;

    console.log(videoFileLocalPath);
    console.log(thumbnailLocalPath);

    if (!videoFileLocalPath) {
      throw new ApiError(400, "Video is required");
    }

    if (!thumbnailLocalPath) {
      throw new ApiError(400, "Video thumbnail is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    console.log(videoFile.url);
    console.log(thumbnail.url);

    if (!videoFile) {
      throw new ApiError(401, "Error while uploading the video on cloudinary");
    }

    if (!thumbnail) {
      throw new ApiError(
        401,
        "Error while uploading the thumbnail on cloudinary"
      );
    }

    const video = await Video.create({
      title,
      description,
      videoFile: videoFile?.url || "",
      thumbnail: thumbnail?.url || "",
      duration: videoFile?.duration,
      owner: req.user,
    });

    console.log(video);

    if (!video) {
      throw new ApiError(401, "Error while publishing video");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video published successfully"));
  } catch (error) {}
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findOne({ _id: videoId });

  if (!video) {
    throw new ApiError(404, "No video found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and Description are required");
  }

  try {
    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
      throw new ApiError(400, "Thumbnail is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail?.url) {
      throw new ApiError(401, "Error while uploading thumbnail on cloudinary");
    }

    const video = await Video.findOneAndUpdate(
      {
        _id: videoId,
      },
      {
        title,
        description,
        // videoFile: videoFile?.url || "",
        thumbnail: thumbnail?.url || "",
        owner: req.user,
      },
      { new: true }
    );

    if (!video) {
      throw new ApiError(401, "Error while updating video details");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video updated successfully"));
  } catch (error) {
    throw new ApiError(401, "Error occurred while updating");
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findByIdAndDelete(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { isVideoPublishedId } = req.params;
  const videoId = isVideoPublishedId;
  
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const isPublished = await Video.findById(videoId).select("isPublished");
  if (!isPublished) {
    throw new ApiError(400, "Video is not published");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, isPublished, "Video is published"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
