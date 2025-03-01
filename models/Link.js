import mongoose from "mongoose";
import connection from "../database/connection.js";

const schema = new mongoose.Schema(
  {
    handle: {
      type: String,
      default: "",
      required: true,
    },
    url: {
      type: String,
      default: "milobrt.fr",
      validate: {
        validator: (value) => {
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        message: "Invalid URL",
      },
      required: true,
    },
    hits: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: new Date().toISOString(),
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    shared: {
      type: Boolean,
      default: false,
    },
  },
  { minimize: false },
);

export default connection.model("links", schema);
