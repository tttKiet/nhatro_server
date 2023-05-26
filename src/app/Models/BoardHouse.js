import mongoose from "mongoose";
const { Schema, models } = mongoose;

const boardHouseSchema = new Schema({
  name: { type: String, default: "" },
  address: { type: String, default: "" },
  phone: { type: String, default: "" },
  electricPrice: { type: string, default: "3000" },
  waterPrice: { type: String, default: "10000" },
  images: [{ type: String }],
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
});

const BoardHouse =
  models.BoardHouse || mongoose.model("BoardHouse", boardHouseSchema);

export default BoardHouse;
