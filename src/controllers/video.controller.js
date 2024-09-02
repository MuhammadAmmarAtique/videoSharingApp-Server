import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

//imgAllowedMimeTypes & videoAllowedMimeTypes to be used in Validating the mimetype of (req.files/req.file of multer) during images & videos upload & updation to ensure user is giving us proper required files for our fields.

const imgAllowedMimeTypes = [
  "image/jpeg", // JPEG
  "image/png", // PNG
  "image/gif", // GIF
  "image/webp", // WebP
  "image/bmp", // BMP
  "image/tiff", // TIFF
  "image/jfif", // JFIF
];

const videoAllowedMimeTypes = [
  "video/mp4",    // MP4
  "video/x-matroska", // MKV
  "video/webm",   // WebM
  "video/ogg",    // Ogg
  "video/quicktime", // MOV (QuickTime)
  "video/x-msvideo", // AVI
  "video/x-ms-wmv",  // WMV
  "video/mpeg",   // MPEG
];


const uploadVideo = asyncHandler(async (req, res) => {
  // 1) user must be authenticated/logged in (verify jwt middleware) + we can get userId from it, to know which user is uploading video.
  // 2) take tile & decription from user
  // 3) take video and thumbnail temporarily then store to disk temporarily using multer and then upload to cloudianry
  // 4) make video object
  // 5) do entry in database
  // 6) return response

  const user = req.user;
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
  // checking if user gave proper video file for "Video"
  if (
    !videoAllowedMimeTypes.includes(
      req.files?.videoFile?.[0]?.mimetype 
    )
  ) {
    throw new ApiError(
      "Invalid file type! Please upload an video file for Video i.e ( MP4,MKV,WebM,Ogg,MOV,AVI, WMV, MPEG)",
      400
    );
  }

  const thumbnailFilePath = req.files?.thumbnail?.[0]?.path;
  // checking if user gave proper image file for "Thumbnail"
   if (
    !imgAllowedMimeTypes.includes(
      req.files?.thumbnail?.[0]?.mimetype 
    )
  ) {
    throw new ApiError(
      "'Invalid file type! Please upload an image file for Thumbnail i.e (jpeg, png, gif, webp, bmp, tiff, jfif).' ",
      400
    );
  }


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
    owner: user._id,
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

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError("Problem in getting video id from url", 400);
  }

  const video = await Video.findById({
    _id: videoId,
  });

  if (!video) {
    throw new ApiError("Video is not found in database", 500);
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched Successfully!"));
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError("Problem in getting video id from url", 400);
  }

  const { title, description } = req.body;

  if (!title?.trim() && !description?.trim()) {
    throw new ApiError(
      "Must give  title or description to update video detials!",
      400
    );
  }

  const video = await Video.findById({ _id: videoId });
  if (!video) {
    throw new ApiError("Unable to find video in database", 500);
  }

  if (title) {
    video.title = title;
    await video.save();
  }

  if (description) {
    video.description = description;
    await video.save();
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, "Video details updated successfully!"));
});

const updateVideoThumbnail = asyncHandler(async (req, res) => {
  // 1) find video after getting video id from url
  // 2) hold old thumbnail url in variable to delete it from cloudinary  after successful updation
  // 3) get new thumbnail from user, store it temporarily in disk through multer then upload it in cloudinary
  // 4) update document
  // 5) delete old thumbnail
  // 6) send response of successful thumbnail updation

  // 1)
  const { videoId } = req.params;

  const video = await Video.findById({ _id: videoId });

  if (!video) {
    throw new ApiError(
      "Problem in getting video from database, Wrong Videoid or video doesnot exist in db",
      400
    );
  }
  // 2)
  const oldThumbnail = video.thumbnail;

  // 3)
  const newThumbnail = req.file?.path;

  if (!newThumbnail) {
    throw new ApiError("Must give new image to update thumbnail", 400);
  }

   //checking if user gave us proper image file for Thumbnail
   if (!imgAllowedMimeTypes.includes(req.file?.mimetype)) {
    throw new ApiError(
      "'Invalid file type! Please upload an image file for Thumbnail i.e (jpeg, png, gif, webp, bmp, tiff, jfif).' ",
      400
    );
  }

  const uploadedNewThumbnail = await uploadOnCloudinary(newThumbnail);

  if (!uploadedNewThumbnail) {
    throw new ApiError("Problem in uploading new thumbnail in cloudinary", 500);
  }

  // 4)
  video.thumbnail = uploadedNewThumbnail.url;
  await video.save();

  // 5)
  await deleteFromCloudinary(oldThumbnail);

  // 6)
  res
    .status(200)
    .json(new ApiResponse(200, video, "Thumbnail updated Successfully!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  // 1) get video id from url
  // 2) find video
  // 3) add toggle functionality
  // 4) update object
  // 5) sen res
  const { videoId } = req.params;
  const video = await Video.findById({
    _id: videoId,
  });

  if (!video) {
    throw new ApiError("Problem in finding video database", 500);
  }

  if (video.isPublished === true) {
    video.isPublished = false;
    await video.save();
  } else {
    video.isPublished = true;
    await video.save();
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, video, "Successfully toggled Video Publish Status")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById({
    _id: videoId,
  });

  if (!video) {
    throw new ApiError("Problem in finding video from database", 500);
  }

  const videoFileTobeDeleted = video.videoFile;
  const thumbnailTobeDeleted = video.thumbnail;

  await video.deleteOne();

  await deleteFromCloudinary(videoFileTobeDeleted);
  await deleteFromCloudinary(thumbnailTobeDeleted);

  res.status(200).json(new ApiResponse(200, {}, "Successfully deleted video!"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType } = req.query;
  const user = req.user;

  //converting string to number
  const pageValue = Number(page);
  const limitValue = Number(limit);

  //matchStage object will hold the criteria for filtering videos inside aggregation pipeline
  const matchStage = {};
  if (query) {
    //what ever query user writes we will search user query kws with-in videos title.
    matchStage.title = {
      $regex: query,
      $options: "i",
    };
  }

  const sortDirection = sortType === "asc" ? 1 : -1;

  const aggregationPipeline = [
    {
      $match: {
        //0)getting all user uploaded videos
        owner: new mongoose.Types.ObjectId(user._id),
      },
    },
    { $match: matchStage }, //1) filtering
    { $sort: { [sortBy]: sortDirection } }, //2) sorting
  ];

  const options = {
    page: pageValue,
    limit: limitValue,
  };

  let videos;
  // 3) applying pagination
  await Video.aggregatePaginate(Video.aggregate(aggregationPipeline), options)
    .then((result) => {
      videos = result;
    })
    .catch((err) => {
      {
        throw new ApiError(
          "Error in paginating all videos documents!",
          500,
          err
        );
      }
    });

  if (videos.docs.length === 0) {
    throw new ApiError("Your query doenot matched any video or User doesnot have any Videos uploaded!", 400);
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videos,
        "Successfuly fetched videos after filtering and sorting from database, then applied pagination functionality to it!"
      )
    );
});

export {
  uploadVideo,
  getVideoById,
  updateVideoDetails,
  updateVideoThumbnail,
  togglePublishStatus,
  deleteVideo,
  getAllVideos,
};
