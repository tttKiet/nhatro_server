import { Feedback } from "../app/Models";
var ObjectId = require("mongoose").Types.ObjectId;

const createFeedback = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { title, message } = data;

      const FeedbackDoc = await Feedback.create({
        userId: id,
        title,
        content: message,
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
const getAllFeedbackByUserId = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(id);
      if (!isValid) {
        resolve({
          err: 1,
          message: `Id not valid`,
        });
      }
      const feedbackDoc = await Feedback.find({ userId: id });
      if (feedbackDoc) {
        resolve({
          err: 0,
          message: "Success!",
          data: feedbackDoc,
        });
      }
      resolve({
        err: 2,
        message: `Something went wrong at getAllFeedbackByUserId`,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateFeedback = (_id, { title, content }) => {
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
  getAllFeedbackByUserId,
  updateFeedback,
  deleteFeedback,
};
