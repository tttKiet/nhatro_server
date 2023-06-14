import mongoose from "mongoose";
const { Schema, models } = mongoose;

const feedbackSchema = new Schema({
  userId :{ type: mongoose.Types.ObjectId, ref: "User" },
  title : {type: String},
  content: {type: String},
},{timestamps:true});

const Feedback = models.Feedback || mongoose.model("Feedback", feedbackSchema);


export default Feedback;
