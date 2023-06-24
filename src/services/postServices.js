import { Post, User } from "../app/Models";

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

const getUserPost = ({ index, _author }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(_author);
      if (!isValid) {
        return resolve({
          err: 1,
          message: `${_author} Invalid!`,
        });
      }
      if (index == 1) {
        const postDoc = await Post.find()
          .populate("user")
          .where({ user: _author })
          .sort({
            createdAt: "desc",
          })
          .limit(1);
        console.log(postDoc);
        if (!postDoc) {
          return resolve({
            err: 2,
            message: "Failed to find post!",
          });
        }
        return resolve({
          err: 0,
          message: "Ok!",
          data: postDoc,
        });
      }

      return resolve({
        err: 3,
        message: "Error",
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
};
