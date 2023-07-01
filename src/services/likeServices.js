import { Like, Post, User } from "../app/Models";
import * as dotenv from "dotenv";
var ObjectId = require("mongoose").Types.ObjectId;
dotenv.config();

const toggleLike = ({ postId, userId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(postId) && ObjectId.isValid(userId);
      if (!isValid) {
        return resolve({
          err: 2,
          message: `Invalid input!`,
        });
      }

      const likeDoc = await Like.findOneAndDelete({
        post: postId,
        user: userId,
      });

      if (likeDoc) {
        return resolve({
          err: 0,
          message: "Remoted like this post!",
        });
      } else {
        const userExists = await User.findById(userId);
        if (!userExists) {
          return resolve({
            err: 3,
            message: "User not found!",
          });
        }

        const postExists = await Post.findById(postId);
        if (!postExists) {
          return resolve({
            err: 3,
            message: "Post not found!",
          });
        }

        const newLikeDoc = await Like.create({
          post: postId,
          user: userId,
        });

        if (newLikeDoc) {
          return resolve({
            err: 0,
            message: "Liked!",
          });
        } else {
          return resolve({
            err: 1,
            message: "Faild!",
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};

export default { toggleLike };
