import mongoose from "mongoose";

const { Schema } = mongoose;

const roomSchema = new Schema({
  number: { type: Number, default: 1 },
  size: { type: Number, default: 1 },
  isLayout: { type: Boolean, default: false },
  price: { type: String, default: "" },
  description: { type: String, default: "" },
  images: [{ type: String, default: [] }],
  boardHouseId: { type: mongoose.Types.ObjectId, ref: "BoardHouse" },
});

roomSchema.pre("save", async function (next) {
  const Room = mongoose.model("Room", roomSchema);

  const existingRoomsCount = await Room.countDocuments({
    boardHouseId: this.boardHouseId,
  });

  // Tăng số thứ tự lên 1 nếu không có phòng nào tồn tại với boardHousesId này trước đó
  this.number = existingRoomsCount === 0 ? 1 : existingRoomsCount + 1;

  next();
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
