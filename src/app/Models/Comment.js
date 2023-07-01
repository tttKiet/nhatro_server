import mongoose, { models } from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    content: { type: String, required: true },
    post: { type: mongoose.Types.ObjectId, ref: "Post" },
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    commentParent: { type: mongoose.Types.ObjectId, ref: "Comment" },
  },
  {
    timestamps: true,
  }
);

const Comment = models.Comment || mongoose.model("Comment", commentSchema);

export default Comment;
