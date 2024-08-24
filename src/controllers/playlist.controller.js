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

  console.log("playlist: ", playlist);
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created Successfully!"));
});

export { createPlaylist };
