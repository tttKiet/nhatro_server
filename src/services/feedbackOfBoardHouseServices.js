import { FeedbackOfBoardHouse } from "../app/Models";
var ObjectId = require("mongoose").Types.ObjectId;

const createFeedback = (boardHouseId, userId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { title, message, star } = data;

      const FeedbackDoc = await FeedbackOfBoardHouse.create({
        user: userId,
        boardHouse: boardHouseId,
        title,
        message,
        star,
      });

      if (FeedbackDoc) {
        resolve({
          err: 0,
          message: "Created feedback successfully!",
          data: FeedbackDoc,
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

const checkAlreadyFeedback = (userId, boardHouseId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const feedbackDoc = await FeedbackOfBoardHouse.findOne({
        user: userId,
        boardHouse: boardHouseId,
      });
      if (feedbackDoc) {
        resolve({
          err: 0,
          message: "This user already has feedback",
          data: feedbackDoc,
          isFeedback: true,
        });
      }
      resolve({
        err: 0,
        message: "This user hadn't feedback yet",
        isFeedback: false,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateFeedback = (feedbackId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { title, message, star } = data;

      const feedbackDoc = await FeedbackOfBoardHouse.findByIdAndUpdate(
        feedbackId,
        {
          title,
          message,
          star,
        }
      );

      if (feedbackDoc) {
        resolve({
          err: 0,
          message: "Updated feedback successfully!",
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

const deleteFeedback = (feedbackId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const feedbackDoc = await FeedbackOfBoardHouse.findByIdAndDelete(
        feedbackId
      );

      if (feedbackDoc) {
        resolve({
          err: 0,
          message: "Delete feedback successfully!",
        });
      }

      resolve({
        err: 1,
        message: `Something went wrong at deleteFeedback !!!`,
      });
    } catch (err) {
      reject(err);
    }
  });
};

const getAllFeedbackById = (boardHouseId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const feedbackDoc = await FeedbackOfBoardHouse.find({
        boardHouse: boardHouseId,
      }).populate("user");

      function countStar(arr) {
        let count = 0;
        for (let i = 0; i < arr.length; i++) {
          count += parseInt(arr[i].star);
        }

        return parseInt(count) / arr.length;
      }

      if (feedbackDoc.length > 0) {
        resolve({
          err: 0,
          message: "Get feedback successfully!",
          data: feedbackDoc,
          rating: Math.round(countStar(feedbackDoc) * 100) / 100,
        });
      } else {
        resolve({
          err: 0,
          message: "This board house hasn't any feeback!",
          data: feedbackDoc,
        });
      }

      resolve({
        err: 1,
        message: `Something went wrong at getAllFeedbackById !!!`,
      });
    } catch (err) {
      reject(err);
    }
  });
};

export default {
  createFeedback,
  checkAlreadyFeedback,
  getAllFeedbackById,
  updateFeedback,
  deleteFeedback,
};
