import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";

const addComment = asyncHandler(async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError("Type something to add a comment!", 400);
  }

  const comment = await Comment.create({
    content,
    owner: user._id,
    video: videoId,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, comment, "Added Comment Successfully in  a Video!")
    );
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { newComment } = req.body;
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      content: newComment,
    },
    { new: true }
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedComment, "Comment updated Successfully!")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  await Comment.findByIdAndDelete(commentId);

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted Successfully!"));
});

export { addComment, updateComment, deleteComment };