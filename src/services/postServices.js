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

export default {
  createPost,
};
