import mongoose, { models } from "mongoose";
import moment from "moment";

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    content: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    images: [{ type: String }],
    hashTag: { type: String },
  },
  {
    timestamps: true,
  }
);

const Post = models.Post || mongoose.model("Post", postSchema);

export default Post;
