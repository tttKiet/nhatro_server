import mongoose from "mongoose";
const { Schema, models } = mongoose;

const accountSchema = new Schema(
  {
    providerId: { type: String },
    uid: { type: String, unique: true },
    userId: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Account = models.Account || mongoose.model("Account", accountSchema);

export default Account;
