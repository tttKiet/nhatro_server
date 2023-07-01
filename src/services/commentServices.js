import { User, Account, Post, Comment } from "../app/Models";
import * as dotenv from "dotenv";
var ObjectId = require("mongoose").Types.ObjectId;
dotenv.config();

const createCmt = async ({ content, parentId, userId, postId }) => {
  return new Promise((resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(postId) && ObjectId.isValid(userId);
      if (!isValid) {
        return resolve({
          err: 1,
          message: `Id input invalid!`,
        });
      }

      const checked = Promise.all([
        User.findById(userId),
        Post.findById(postId),
      ]);

      checked.then(([user, post]) => {
        if (!user || !post) {
          return resolve({
            err: 2,
            message: `Post or User not found!`,
          });
        } else {
          Comment.create({
            content,
            post: postId,
            user: userId,
            commentParent: parentId,
          }).then((comment) => {
            if (comment) {
              return resolve({
                err: 0,
                message: `Created comment!`,
              });
            }
          });
        }
      });
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

export default { createCmt };
