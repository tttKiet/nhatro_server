import mongoose, { models } from "mongoose";

const { Schema } = mongoose;

const favouritePostSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User" },
    postId: { type: mongoose.Types.ObjectId, ref: "Post" },
  },
  {
    timestamps: true,
  }
);

const FavouritePost =
  models.FavouritePost || mongoose.model("FavouritePost", favouritePostSchema);

export default FavouritePost;
