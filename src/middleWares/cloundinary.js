import cloudinary from "cloudinary";
const cloudinaryV2 = cloudinary.v2;
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { default as dotenv } from "dotenv";
dotenv.config();
import path from "path";

cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryV2,
  allowedFormats: ["jpg", "png"],
  params: {
    folder: "motel_posts",
  },
});

const fileFilter = (req, file, cb) => {
  // Kiểm tra phần mở rộng của tệp
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    // Nếu là một tệp ảnh hợp lệ, cho phép tải lên
    return cb(null, true);
  } else {
    // Nếu không phải là tệp ảnh hợp lệ, từ chối tải lên và trả về lỗi
    cb("Error: Only image files (jpeg, jpg, png) are allowed!");
  }
};

const parser = multer({ storage: storage, fileFilter });

export default parser;
