import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const user = req.user;

  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(
      "Both name and description is must required for creating Playlist!",
      400
    );
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: user._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created Successfully!"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: { videos: videoId }, //push operator adds videoId to existing array
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(
      "Problem during updating Playlist!",
      500
    );
  }

  res
  .status(200)
  .json(new ApiResponse(200, updatedPlaylist, "Added video in Playlist Successfully!"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId }, // pull operator will remove videoId from  array
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(
      "Problem during updating Playlist!",
      500
    );
  }

  res
  .status(200)
  .json(new ApiResponse(200, updatedPlaylist, "Removed video from Playlist Successfully!"));
});


export { createPlaylist, addVideoToPlaylist, removeVideoFromPlaylist };
