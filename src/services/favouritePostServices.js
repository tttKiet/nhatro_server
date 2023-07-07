import { FavouritePost } from "../app/Models";

const createFavouritePost = (postId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const favouritePostDocExisted = await FavouritePost.find({
        postId: postId,
        userId: userId,
      });

      if (favouritePostDocExisted.length > 0) {
        return resolve({
          err: 0,
          message: "This post has already been saved",
        });
      }

      const favouritePostDoc = await FavouritePost.create({
        postId: postId,
        userId: userId,
      });

      const populatedFavouritePostDoc = await FavouritePost.findById(
        favouritePostDoc._id
      ).populate("postId");

      if (populatedFavouritePostDoc) {
        return resolve({
          err: 0,
          message: "Add favourite post successfully",
          data: populatedFavouritePostDoc,
        });
      }

      return resolve({
        err: 2,
        message: "Something went wrong at createFavouritePost!",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getFavouritePost = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const favouritePostDoc = await FavouritePost.find({
        userId: userId,
      }).populate({
        path: "postId",
        populate: {
          path: "user",
        },
      });

      if (favouritePostDoc) {
        return resolve({
          err: 0,
          message: "Get favourite post successfully",
          data: favouritePostDoc,
        });
      }

      return resolve({
        err: 1,
        message: "Something went wrong at getFavouritePost!",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const removeFavouritePost = (userId, fvId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const favouritePostDoc = await FavouritePost.findOneAndDelete({
        _id: fvId,
        userId: userId,
      });

      if (favouritePostDoc) {
        return resolve({
          err: 0,
          message: "Remove favourite post successfully",
          data: favouritePostDoc,
        });
      }

      return resolve({
        err: 1,
        message: "This favourite post was deleted",
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default { createFavouritePost, getFavouritePost, removeFavouritePost };
