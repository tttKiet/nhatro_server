import mongoose from "mongoose";
const { Schema, models } = mongoose;

const userSchema = new Schema({
  fullName: String,
  email: String,
  password: String,
  type: String,
  phone: String,
  address: String,
});

const User = models.User || mongoose.model("User", userSchema);

export default User;
