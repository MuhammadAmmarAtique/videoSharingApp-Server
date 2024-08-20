import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";

const uploadVideo = asyncHandler(async (req, res) => {
  // 1) user must be authenticated/loged in (verify jwt middleware)
  // 2) take tile & decription from user
  // 3) take video and thumbnail temporarily then store to disk temporarily using multer and then upload to cloudianry
  // 4) make video object
  // 5) do entry in database
  // 6) return response

  const { title, description } = req.body;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(
      "Both title and description are must required for publishing video!",
      400
    );
  }

  if (!req.files.videoFile || !req.files.thumbnail) {
    throw new ApiError(
      "Both videoFile and thumbnail are must required for publishing video!",
      400
    );
  }

  const videoFilePath = req.files?.videoFile?.[0]?.path;
  const thumbnailFilePath = req.files?.thumbnail?.[0]?.path;

  if (!videoFilePath || !thumbnailFilePath) {
    throw new ApiError(
      "Both videoFile and thumbnail are must required for publishing video!",
      400
    );
  }

  const uploadedVideo = await uploadOnCloudinary(videoFilePath);
  const uploadedThumbnail = await uploadOnCloudinary(thumbnailFilePath);

  const video = await Video.create({
    videoFile: uploadedVideo.url,
    thumbnail: uploadedThumbnail.url,
    title: title,
    description: description,
    duration: uploadedVideo.duration,
  });

  if (!video) {
    throw new ApiError(
      "Problem while uploading video document in Database!",
      500
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video Uploaded/published Successfully!")
    );
});

export { uploadVideo };