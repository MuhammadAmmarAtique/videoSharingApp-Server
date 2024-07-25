import dbConnection from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import app from "./app.js";

// 2nd approach of Database Connection
dbConnection() //async function returns a promise we can run .then and .catch on it.
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server successfully started on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Database Connection Failed :: line 10 index.js::", error);
  });

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
