import mongoose from "mongoose";
const { Schema, models } = mongoose;

const userSchema = new Schema(
  {
    fullName: String,
    email: { type: String, trim: true },
    password: String,
    type: { type: String, default: "user" },
    emailVerified: { type: Boolean, default: false },
    avatar: { type: String, default: "svg" },
    phone: String,
    address: String,
    bio: String,
    personalities: [{ type: String }],
    school: String,
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);

export default User;
