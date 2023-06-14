import mongoose, { models } from "mongoose";
import moment from "moment";

const { Schema } = mongoose;

const codeSchema = new Schema({
  code: { type: String, required: true },
  email: { type: String, required: true },
  user: { type: mongoose.Types.ObjectId, ref: "User" },
  expires: { type: Date },
});

// Hook trước khi lưu bản ghi mới
codeSchema.pre("save", function (next) {
  // Kiểm tra nếu expires chưa được xác định
  if (!this.expires) {
    const expirationTime = moment().add(5, "minutes").format("LLL");
    console.log("expirationTime ", expirationTime);
    this.expires = expirationTime;
  }
  next();
});

const Code = models.Code || mongoose.model("Code", codeSchema);

export default Code;
