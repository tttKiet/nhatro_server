import { verifyEmail } from "../utils";
import crypto from "crypto";

const sendCodeEmail = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const verificationCode = crypto.randomBytes(3).toString("hex");
      await verifyEmail(email, verificationCode);
      resolve(verificationCode);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

export default { sendCodeEmail };
