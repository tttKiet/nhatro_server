import { Feedback } from "../app/Models";
var ObjectId = require("mongoose").Types.ObjectId;

const createFeedback = ({ userId, title, content}) => {
    return new Promise(async (resolve, reject) => {
      try {
        const FeedbackDoc = await Feedback.create({
          userId,
          title,
          content,
        });
  
        if (FeedbackDoc) {
          resolve({
            err: 0,
            message: "Created Feedback!",
          });
        }
  
        resolve({
          err: 1,
          message: `Something went wrong !!!`,
        });
      } catch (err) {
        reject(err);
      }
    });
  };
  const getAllFeedback = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const users = await Feedback.find({ type: { $ne: "root" } });
        if (users)
          resolve({
            err: 0,
            message: "Get feedbacks thanh cong",
            dataUser: users,
          });
        else {
          resolve({
            err: 1,
            message: "Get feedbacks that bai",
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const updateFeedback = (_id, {title,content }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const isValid = ObjectId.isValid(_id);
        if (!isValid) {
          return resolve({
            err: 3,
            message: `${_id} không phải là id đúng định dạng!`,
          });
        }
  
        const feedbackDoc = await Feedback.findOneAndUpdate(
          { _id },
          {
            title,
            content,
          }
        );
  
        if (feedbackDoc) {
          return resolve({
            err: 0,
            message: "Đã Cập nhật feedback!",
          });
        }
  
        resolve({
          err: 1,
          message: `Không tìm thấy feedback cua người dùng ${_id}!`,
        });
      } catch (err) {
        reject(err);
      }
    });
  };
  
  const deleteFeedback = async (_id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const isValid = ObjectId.isValid(_id);
        if (!isValid) {
          return resolve({
            err: 3,
            message: `${_id} không phải là id đúng định dạng!`,
          });
        }
        const feedback = await Feedback.deleteOne({ _id });
        if (feedback)
          return resolve({
            err: 0,
            message: `Xóa feedback thành công!`,
            dataFeedback: feedback,
          });
        else {
          resolve({
            err: 2,
            message: `Không tìm thấy thông tin người dùng ${_id}!`,
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  export default {
    createFeedback,
    getAllFeedback,
    updateFeedback,
    deleteFeedback,
  };