import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose, { isValidObjectId } from "mongoose";

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
    throw new ApiError("Problem during updating Playlist!", 500);
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Added video in Playlist Successfully!"
      )
    );
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
    throw new ApiError("Problem during updating Playlist!", 500);
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Removed video from Playlist Successfully!"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError("Problem during getting Playlist!", 500);
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Successfully fetched Playlist from database!"
      )
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
const userId = req.user._id

 const AggregationPipeline = await Playlist.aggregate([
   {
     $match:{
       owner: userId
      }
    },
    {
      $lookup:{
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      }
    },
    {
      $project:{
        videos:1
      }
    }
  ])
  
  console.log("AggregationPipeline: ", AggregationPipeline);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        AggregationPipeline,
        "Successfully fetched User Playlist containing all videos from database!"
      )
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  
  if (!name?.trim() &&  !description?.trim()) {
    throw new ApiError("Must give either one of name or description to update playlist! ", 400);
  }

  const playlist = await Playlist.findById(playlistId)
  
  if (name) {
    playlist.name = name
    await playlist.save()
  }

  if (description) {
    playlist.description = description
    await playlist.save()
  }

  res
  .status(200)
  .json(
    new ApiResponse(
      200,
      playlist,
      "Successfully updated Playlist!"
    )
  );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const {playlistId} = req.params
  await Playlist.findByIdAndDelete(playlistId);

   res
  .status(200)
  .json(
    new ApiResponse(
      200,
      {},
      "Successfully deleted Playlist!"
    )
  );
})

export {
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getPlaylistById,
  getUserPlaylists,
  updatePlaylist,
  deletePlaylist,
};
