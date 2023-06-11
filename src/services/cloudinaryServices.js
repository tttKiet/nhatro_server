import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const opts = {
  overwrite: true,
  invalidate: true,
  resource_type: "auto",
};

const extractPublicId = (imageUrl) => {
  const urlParts = imageUrl.split("/");
  const filename = urlParts[urlParts.length - 1];
  const publicId = filename.split(".")[0];
  return publicId;
};

const uploadImage = (image) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(image, opts, (error, result) => {
      if (result && result.secure_url) {
        // console.log(result.secure_url);
        return resolve({
          err: 0,
          message: "Upload a image successfully",
          data: result.secure_url,
        });
      }
      return reject({ message: error.message });
    });
  });
};

const uploadMultipleImages = (images) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(images)) {
      return reject({
        message: "Invalid images format. Expected an array.",
      });
    }
    // return a array of images
    const uploads = images.map((base) => uploadImage(base)); //TypeError: images.map is not a function
    Promise.all(uploads)
      .then((values) => {
        return resolve({
          err: 0,
          message: "Upload images successfully",
          data: values,
        });
      })
      .catch((err) => reject(err));
  });
};

const deleteSingleImg = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const publicId = extractPublicId(imageUrl);

    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (result && result.result === "ok") {
        return resolve({
          err: 0,
          message: "Image deleted successfully",
        });
      }
      return reject({ message: error.message });
    });
  });
};

const deleteMultiplyImgs = (imageUrls) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(imageUrls)) {
      return reject({
        message: "Invalid imageUrls format. Expected an array.",
      });
    }

    const deletions = imageUrls.map((imageUrl) => deleteSingleImg(imageUrl));

    Promise.all(deletions)
      .then(() => {
        return resolve({
          err: 0,
          message: "Images deleted successfully",
        });
      })
      .catch((err) => reject(err));
  });
};

export default {
  uploadImage,
  uploadMultipleImages,
  deleteSingleImg,
  deleteMultiplyImgs,
};
