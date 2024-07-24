import mongoose, { isValidObjectId, syncIndexes } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const owner = req.user._id;

  if (!name) {
    throw new ApiError(404, "Name is required");
  }

  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: owner,
  });

  if (!playlist) {
    throw new ApiError(404, "Error while creating playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const playlist = await Playlist.find({
    owner: userId,
  });

  if (!playlist) {
    throw new ApiError(404, "No Playlist found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(404, "No playlist found");
  }

  const playlist = await Playlist.findById({ _id: playlistId });

  if (!playlist) {
    throw new ApiError(404, "No playlist found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(404, "All fields are required");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(404, "No playlist found");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "No video found");
  }

  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
    },
    {
      $addToSet: {
        videos: videoId,
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(
      404,
      "Something went wrong while uploading video to playlist"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(404, "Playlist not found");
  }

  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
    },
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!playlist) {
    throw new ApiError(404, "Error while loading playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(401, "Invalid playlist ID");
  }

  const playlist = await Playlist.findOneAndDelete({
    _id: playlistId,
  });

  if (!playlist) {
    throw new ApiError(401, "Error while deleting playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(404, "Name and Description is required");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    { _id: playlistId },
    {
      name: name,
      description: description,
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Error while updating playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
