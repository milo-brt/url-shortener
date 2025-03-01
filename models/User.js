import mongoose from "mongoose";
import connection from "../database/connection.js";

const schema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: new Date().toISOString(),
    },
    idpId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    ticket: {
      type: String,
      default: null,
    },
    session: {
      type: String,
      default: null,
    },
  },
  { minimize: false },
);

export default connection
  .useDb("url-shortener")
  .model("users", schema);
