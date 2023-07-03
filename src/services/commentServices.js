import { User, Account, Post, Comment } from "../app/Models";
import * as dotenv from "dotenv";
var ObjectId = require("mongoose").Types.ObjectId;
dotenv.config();

const createCmt = async ({ content, parentId, userId, postId }) => {
  return new Promise((resolve, reject) => {
    try {
      let isValid;
      if (postId) {
        isValid = ObjectId.isValid(postId) && ObjectId.isValid(userId);
      } else {
        isValid = ObjectId.isValid(parentId) && ObjectId.isValid(userId);
      }
      if (!isValid) {
        return resolve({
          err: 1,
          message: `Id input invalid!`,
        });
      }

      let checked;
      if (postId) {
        checked = Promise.all([User.findById(userId), Post.findById(postId)]);
      } else {
        checked = Promise.all([
          User.findById(userId),
          Comment.findById(parentId),
        ]);
      }

      checked.then(([user, modalDoc]) => {
        if (!user || !modalDoc) {
          return resolve({
            err: 2,
            message: `Document not found!`,
          });
        } else {
          Comment.create({
            content,
            post: postId || undefined,
            user: userId,
            commentParent: parentId || undefined,
          }).then(async (comment) => {
            if (comment) {
              const getCm = await Comment.findById(comment._id)
                .populate("user", "fullName avatar emailVerified _id")
                .populate({
                  path: "commentParent",
                  populate: {
                    path: "user",
                    select: "fullName avatar emailVerified _id",
                  },
                });
              if (!getCm) {
                return resolve({
                  err: 3,
                  message: `Notget comment!`,
                });
              }
              return resolve({
                err: 0,
                message: `Created comment!`,
                newComment: getCm,
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

const getCommentPost = (postId, page = 1) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(postId);
      if (!isValid) {
        return resolve({
          err: 1,
          message: `Id input invalid!`,
        });
      }
      const pageSize = 3;
      const skip = (page - 1) * pageSize;
      const cmtCount = await Comment.find({ post: postId }).count();
      const cmtDoc = await Comment.find({ post: postId })
        .populate("user", "fullName avatar emailVerified _id")
        .sort({
          createdAt: "desc",
        })
        .skip(skip)
        .limit(pageSize)
        .lean();

      if (!cmtDoc) {
        return resolve({
          err: 2,
          message: "Failed to find cmt!",
        });
      }

      const cmts = cmtDoc.map((cmt) => {
        return getChildComments(cmt._id);
      });

      Promise.all(cmts)
        .then((commentChild) => {
          const data = Array.from(cmtDoc).map((item, index) => {
            return {
              ...item,
              child: {
                count: commentChild[index].length,
                comment: commentChild[index].slice(0, 3),
              },
            };
          });
          // console.log(commentChild);

          const maxCmt = commentChild.reduce((init, value) => {
            console.log(value);
            return init + value.length;
          }, cmtCount);

          return resolve({
            err: 0,
            message: `OK!`,
            data: data,
            count: cmtCount,
            maxCmt: maxCmt,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (e) {
      reject(e);
    }
  });
};

const getChildComments = async (parentId) => {
  try {
    const cmtChild = await Comment.find({
      commentParent: parentId,
    })
      .populate("user", "fullName avatar emailVerified _id")
      .populate({
        path: "commentParent",
        populate: {
          path: "user",
          select: "fullName avatar emailVerified _id",
        },
      });

    if (cmtChild.length === 0) return [];

    for (const cmt of cmtChild) {
      const comments = await getChildComments(cmt._id);
      return cmtChild.concat(comments);
    }
  } catch (e) {
    throw e;
  }
};

const getChildCommentById = async ({ id, page, type }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(id);
      if (!isValid) {
        return resolve({
          err: 1,
          message: `Id input invalid!`,
        });
      }
      const cmtDoc = await Comment.findById(id);
      if (!cmtDoc) {
        return resolve({
          err: 2,
          message: `Comment not found!`,
        });
      }

      const pageSize = 3;
      const limit = page * pageSize;

      const data = await getChildComments(id);
      if (data) {
        let newData;

        if (type == "all") {
          newData = data;
        } else {
          newData = data.slice(3 * (page - 1), limit);
        }

        resolve({
          err: 0,
          message: `Ok!`,
          data: newData,
        });
      } else {
        resolve({
          err: 2,
          message: `Error!`,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

export default { createCmt, getCommentPost, getChildCommentById };
