import { Post, User, Like } from "../app/Models";

var ObjectId = require("mongoose").Types.ObjectId;

const createPost = ({ _id, files, hashTag, content }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(_id);
      if (!isValid) {
        return resolve({
          err: 2,
          message: `${_id} Invalid!`,
        });
      }

      const author = await User.findById({ _id });
      if (!author) {
        return resolve({
          err: 4,
          message: `Author not found!`,
        });
      }

      const paths = files.map((f) => f.path);

      const postDoc = await Post.create({
        content,
        user: _id,
        images: paths,
        hashTag: hashTag ? hashTag : undefined,
      });

      if (!postDoc) {
        return resolve({
          err: 3,
          message: `Error creating post!`,
        });
      } else {
        return resolve({
          err: 0,
          message: `Created post!`,
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};

const getPosts = ({ page = 1 }) => {
  const pageSize = 10;
  return new Promise(async (resolve, reject) => {
    try {
      const skip = (page - 1) * pageSize;
      const postCount = await Post.count();
      const postDoc = await Post.find()
        .populate("user")
        .sort({
          createdAt: "desc",
        })

        .skip(skip)
        .limit(pageSize);

      if (!postDoc) {
        return resolve({
          err: 1,
          message: "Failed to find post!",
        });
      }
      return resolve({
        err: 0,
        message: "Ok!",
        data: { posts: postDoc, limit: postCount },
      });
    } catch (err) {
      reject(err);
    }
  });
};

const getUserPost = ({ index, _author, page = 1 }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(_author);
      if (!isValid) {
        return resolve({
          err: 1,
          message: `${_author} Invalid!`,
        });
      }

      let postDoc;
      if (index == 1) {
        postDoc = await Post.find()
          .populate("user")
          .where({ user: _author })
          .sort({
            createdAt: "desc",
          })
          .limit(1);
        if (!postDoc) {
          return resolve({
            err: 2,
            message: "Failed to find post!",
          });
        }
      } else {
        const pageSize = 10;
        const skip = (page - 1) * pageSize;
        const postCount = await Post.find({ user: _author }).count();
        postDoc = await Post.find()
          .populate("user")
          .where({ user: _author })
          .sort({
            createdAt: "desc",
          })
          .skip(skip)
          .limit(pageSize);
        if (!postDoc) {
          return resolve({
            err: 2,
            message: "Failed to find post!",
          });
        }
        return resolve({
          err: 0,
          message: "Ok!",
          data: {
            limit: postCount,
            posts: postDoc,
          },
        });
      }
      return resolve({
        err: 0,
        message: "Ok!",
        data: postDoc,
      });
    } catch (err) {
      reject(err);
    }
  });
};

const getLike = ({ postId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(postId);
      if (!isValid) {
        return resolve({
          err: 1,
          message: `${postId} Invalid!`,
        });
      }

      const userLiked = await Like.find({ post: postId }).populate(
        "user",
        "_id fullName avatar"
      );

      return resolve({
        err: 0,
        data: userLiked,
        likedCount: userLiked.length,
      });
    } catch (err) {
      reject(err);
    }
  });
};

export default {
  createPost,
  getPosts,
  getUserPost,
  getLike,
};
