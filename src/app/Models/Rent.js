import mongoose, { models } from "mongoose";

const { Schema } = mongoose;

const rentSchema = new Schema(
  {
    status: { type: String, default: 0 },
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    room: { type: mongoose.Types.ObjectId, ref: "Room" },
    startDate: { type: Date },
    endDate: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const Rent = models.Rent || mongoose.model("Rent", rentSchema);

export default Rent;
