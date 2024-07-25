import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

async function dbConnection() {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log("Database Connection Successfull, DB Host::", connectionInstance.connection.host);
  } catch (error) {
    console.log("Database Connection Failed :: line 10, db/index.js::", error);
    process.exit(1);
  }
}

export default dbConnection;
