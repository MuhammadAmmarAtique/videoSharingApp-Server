import mongoose from "mongoose";
import express from "express";
const app = express();

import dotenv from "dotenv";
dotenv.config();
import { DB_NAME } from "./constants.js";

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("Error:: Express App cannot communicate with DB ",error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`Example app listening on port ${process.env.PORT}`)
    })
  } catch (error) {
    console.log("DB connection error",error);
    throw error;
  }
})();
