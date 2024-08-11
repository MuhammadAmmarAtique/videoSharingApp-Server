import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jsonwebtoken from "jsonwebtoken";
import {User} from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {

  try {
    const token =req?.cookies.accessToken || req?.header("Authorization")?.replace("Bearer ", "");
  
      if (!token) {
      throw new ApiError("Unauthorized request", 401); //cannot proceed b/c user is not login as user has no cookies.
    }
    const decodedTokenInfo = jsonwebtoken.verify(token,process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedTokenInfo._id);
  
    if (!user) {
      throw new ApiError("Invalid access Token", 401);
    }
  
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(`User Authentication failed!`,400 ,error )
  }
});
