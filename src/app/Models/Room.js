import mongoose from "mongoose";

const { Schema } = mongoose;

const roomSchema = new Schema({
  number: { type: Number, default: 1 },
  size: { type: Number, default: 1 },
  isLayout: { type: Boolean, default: false },
  price: { type: String, default: "" },
  description: { type: String, default: "" },
  images: [{ type: String, default: [] }],
  options: { type: [{ type: String }], default: [] },
  boardHouseId: { type: mongoose.Types.ObjectId, ref: "BoardHouse" },
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
