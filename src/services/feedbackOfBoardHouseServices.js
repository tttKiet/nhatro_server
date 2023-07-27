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
// const getAllFeedbackByUserId = (id) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const isValid = ObjectId.isValid(id);
//       if (!isValid) {
//         resolve({
//           err: 1,
//           message: `Id not valid`,
//         });
//       }
//       const feedbackDoc = await Feedback.find({ userId: id });
//       if (feedbackDoc) {
//         resolve({
//           err: 0,
//           message: "Success!",
//           data: feedbackDoc,
//         });
//       }
//       resolve({
//         err: 2,
//         message: `Something went wrong at getAllFeedbackByUserId`,
//       });
//     } catch (error) {
//       reject(error);
//     }
//   });
// };

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

// const deleteFeedback = async (_id, userId) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const isValid = ObjectId.isValid(_id);
//       if (!isValid) {
//         return resolve({
//           err: 3,
//           message: `${_id} is not valid!`,
//         });
//       }
//       const feedback = await Feedback.findOneAndDelete({
//         _id: _id,
//         userId: userId,
//       });
//       if (feedback)
//         return resolve({
//           err: 0,
//           message: `Delete feedback successfully`,
//           dataFeedback: feedback,
//         });

//       resolve({
//         err: 2,
//         message: `This feedback was deleted`,
//       });
//     } catch (error) {
//       reject(error);
//     }
//   });
// };

export default {
  createFeedback,
  checkAlreadyFeedback,
  // getAllFeedbackByUserId,
  updateFeedback,
  deleteFeedback,
};
