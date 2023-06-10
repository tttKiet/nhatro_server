import { User, Account, Code } from "../app/Models";
import * as dotenv from "dotenv";
dotenv.config();

const checkCodeForEmail = async (email) => {
  try {
    const currentTimestamp = new Date();
    const codeDoc = await Code.findOne({
      email,
      expires: { $gt: currentTimestamp },
    }).sort({ expires: -1 });

    if (codeDoc) {
      return true;
    }
  } catch (e) {
    return false;
  }
};

export default { checkCodeForEmail };
