import dbConnection from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({path:'./env'});

// 2nd approach of Database Connection
dbConnection();

// 1st approach of Database Connection
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//     console.log("Database Connection Successfull.");
//   }
//   catch (error) {
//     console.log("Database Connection Failed :: line 13 index.js::", error);
//     throw error;
//   }
// })();
