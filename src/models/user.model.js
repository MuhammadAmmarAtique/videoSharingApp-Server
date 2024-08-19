import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String, // cloudinary url
      required: false,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId, //storing videos ids in form of array of objects
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

//Password Hashing Before Saving using bycrypt
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } else {
    return next();
  }
});
//Password Verification Method using bycrypt
userSchema.methods.isPasswordCorrect = async function (UserEnteredPassword) {
  return await bcrypt.compare(UserEnteredPassword, this.password); //true/false will be returned
};
//Access Token Generator Method using jwt
userSchema.methods.generateAccessToken = function () {
  return jsonwebtoken.sign(
    {
      _id: this.id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

//Refresh Token Generator Method using jwt
userSchema.methods.generateRefreshToken = function () {
  return jsonwebtoken.sign(
    {
      _id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
