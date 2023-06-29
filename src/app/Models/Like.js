import mongoose, { models } from "mongoose";

const { Schema } = mongoose;

const likeSchema = new Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    post: { type: mongoose.Types.ObjectId, ref: "Post" },
  },
  {
    timestamps: true,
  }
);

const Like = models.Like || mongoose.model("Like", likeSchema);

export default Like;
