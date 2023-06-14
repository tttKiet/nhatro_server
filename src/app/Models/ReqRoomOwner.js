import mongoose from "mongoose";

const { Schema, models } = mongoose;

const reqRoomOwnerSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User" },
    boardHouseId: { type: mongoose.Types.ObjectId, ref: "BoardHouse" },
    description: { type: String, default: "" },
    status: { type: String, default: "0" },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

const ReqRoomOwner =
  models.ReqRoomOwner || mongoose.model("ReqRoomOwner", reqRoomOwnerSchema);

export default ReqRoomOwner;
