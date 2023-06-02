import mongoose from "mongoose";
import BoardHouse from "./BoardHouse";
const { Schema, models } = mongoose;

const roomSchema = new Schema({
  number: { type: Number, default: 1 },
  size: { type: Number, default: 1 },
  isLayout: { type: Boolean, default: false },
  price: { type: String, default: "" },
  description: { type: String, default: "" },
  images: [{ type: String, default: [] }],
  boardHouseId: { type: mongoose.Types.ObjectId, ref: BoardHouse },
});

const Room = models.Room || mongoose.model("Room", roomSchema);

roomSchema.pre("save", async function (next) {
  const existingRoomsCount = await Room.countDocuments({
    boardHouseId: this.boardHouseId,
  });

  // Tăng số thứ tự lên 1 nếu không có phòng nào tồn tại với boardHousesId này trước đó
  this.number = existingRoomsCount === 0 ? 1 : existingRoomsCount + 1;

  next();
});

export default Room;
