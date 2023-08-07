import mongoose from "mongoose";

const { Schema, models } = mongoose;

const boardHouseSchema = new Schema(
  {
    name: { type: String, default: "" },
    address: { type: String, default: "" },
    description: { type: String, default: "" },
    addressFilter: { type: Object, default: {} },
    phone: { type: String, default: "" },
    electricPrice: { type: String, default: "3000" },
    waterPrice: { type: String, default: "10000" },
    images: [{ type: String, default: [] }],
    options: { type: [{ type: String }], default: [] },
    userId: { type: mongoose.Types.ObjectId, ref: "User" },
    status: { type: String, default: "0" },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

const BoardHouse =
  models.BoardHouse || mongoose.model("BoardHouse", boardHouseSchema);

export default BoardHouse;
