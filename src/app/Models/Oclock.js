import mongoose, { models } from "mongoose";

const { Schema } = mongoose;

const oclockSchema = new Schema(
  {
    electric: { type: Number, default: 0 },
    water: { type: Number, default: 0 },
    oldWater: { type: Number, default: 0 },
    oldElectric: { type: Number, default: 0 },
    room: { type: mongoose.Types.ObjectId, ref: "Room" },
  },
  {
    timestamps: true,
  }
);

const Oclock = models.Oclock || mongoose.model("Oclock", oclockSchema);

export default Oclock;
