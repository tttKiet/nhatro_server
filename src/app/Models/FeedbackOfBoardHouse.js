import mongoose from "mongoose";
const { Schema, models } = mongoose;

const feedbackOfBoardHouse = new Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    boardHouse: { type: mongoose.Types.ObjectId, ref: "BoardHouse" },
    title: { type: String },
    message: { type: String },
    star: { type: String },
  },
  { timestamps: true }
);

const FeedbackOfBoardHouse =
  models.FeedbackOfBoardHouse ||
  mongoose.model("FeedbackOfBoardHouse", feedbackOfBoardHouse);

export default FeedbackOfBoardHouse;
