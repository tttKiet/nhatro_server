import mongoose, { models } from "mongoose";

const { Schema } = mongoose;

const billSchema = new Schema(
  {
    status: { type: String, default: 0 },
    rent: { type: mongoose.Types.ObjectId, ref: "Rent" },
    priceSum: { type: String, default: 0 },
    electricNumber: { type: Number, default: null },
    waterNumber: { type: Number, default: null },
    oldWaterNumber: { type: Number },
    oldElectricNumber: { type: Number },
  },
  {
    timestamps: true,
  }
);

const Bill = models.Bill || mongoose.model("Bill", billSchema);

export default Bill;
