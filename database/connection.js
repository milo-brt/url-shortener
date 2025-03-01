import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

mongoose.set("strictQuery", true);
const conn = await mongoose.createConnection(process.env.MONGO_URI2 + "/url-shortener", () => {
  console.log("║ URL Shortener ✔️                  ║");
}).asPromise();

export default conn;