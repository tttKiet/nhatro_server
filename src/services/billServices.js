import { Bill, Rent, Oclock, BoardHouse } from "../app/Models";
import { rentServices } from "../services";
import * as dotenv from "dotenv";
dotenv.config();
var ObjectId = require("mongoose").Types.ObjectId;

const createBill = async ({ electric, water, rentId, billId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (billId) {
        const billDocAvailable = await Bill.findById(billId).lean();
        const m = new Date(billDocAvailable.createdAt).getMonth() + 1;
        const y = new Date(billDocAvailable.createdAt).getFullYear();
        if (m !== new Date().getMonth() + 1 || y !== new Date().getFullYear()) {
          return resolve({
            err: 4,
            message: "Cannot edit the previous month's value!",
          });
        }
      }
      const rentDoc = await Rent.findById(rentId)
        .populate({
          path: "room",
          select: "number _id price userId",
          populate: {
            path: "boardHouseId",
            select: "name _id electricPrice waterPrice",
          },
        })
        .lean();

      if (!rentDoc) {
        return resolve({
          err: 1,
          message: "Information not found!",
          msg: "Rent not found!",
        });
      }

      // check create or update
      const billOnMonth = await Bill.findOne({
        $expr: {
          $and: [
            { $eq: [{ $year: "$createdAt" }, new Date().getFullYear()] },
            { $eq: [{ $month: "$createdAt" }, new Date().getUTCMonth() + 1] }, // Adding 1 since month is 0-indexed
          ],
        },
        rent: rentId,
      });

      // console.log("billOnMonth, ", billOnMonth);
      let priceSum;
      let billDoc;
      let electricTotal = electric;
      let waterTotal = water;

      let OclockPrev = await Oclock.findOne({
        room: rentDoc.room._id,
      }).lean();

      if (!OclockPrev) {
        OclockPrev = await Oclock.create({ room: rentDoc.room._id });
      }

      // update
      if (billOnMonth) {
        electricTotal =
          electricTotal == 0 || electricTotal
            ? Number.parseFloat(electric) -
              (Number.parseFloat(OclockPrev.oldElectric) || 0)
            : 0;
        waterTotal =
          water == 0 || water
            ? Number.parseFloat(water) -
              (Number.parseFloat(OclockPrev.oldWater) || 0)
            : 0;

        if (
          (water && billOnMonth.oldWaterNumber > water) ||
          (electric && billOnMonth.oldElectricNumber > electric)
        )
          return resolve({
            err: 3,
            message:
              "The value of Electricity and Water must be greater than the old value!",
          });

        const opOclock = {};

        electric >= 0 && (opOclock.electric = electric);
        water >= 0 && (opOclock.water = water);
        await Oclock.findOneAndUpdate(
          {
            _id: OclockPrev._id,
          },
          {
            ...opOclock,
          }
        );
        priceSum =
          Number.parseFloat(rentDoc.room.boardHouseId.electricPrice) *
            Number.parseFloat(electricTotal) +
          Number.parseFloat(rentDoc.room.boardHouseId.waterPrice) *
            Number.parseFloat(waterTotal) +
          Number.parseFloat(rentDoc.room.price);

        const op = {};
        electric && (op.electricNumber = electric);
        water && (op.waterNumber = water);

        await Bill.updateOne(
          { _id: billOnMonth._id },
          {
            ...op,
            priceSum,
          }
        );

        const billUpdated = await Bill.findById(billOnMonth._id);

        return resolve({
          err: 0,
          message: "Updated bill!",
          bill: billUpdated,
        });
      }

      // create bill
      // find bill a month before

      electricTotal = electric
        ? electric - (Number.parseFloat(OclockPrev.electric) || 0)
        : 0;
      waterTotal = water
        ? water - (Number.parseFloat(OclockPrev.water) || 0)
        : 0;

      if (electricTotal < 0 || waterTotal < 0)
        return resolve({
          err: 3,
          message:
            "The value of Electricity and Water must be greater than the old value!",
        });

      if (electricTotal && waterTotal)
        await Oclock.findOneAndUpdate(
          {
            _id: OclockPrev._id,
          },
          {
            electric,
            water,
            oldWater: OclockPrev.water,
            oldElectric: OclockPrev.electric,
          }
        );

      priceSum =
        Number.parseFloat(rentDoc.room.boardHouseId.electricPrice) *
          Number.parseFloat(electricTotal) +
        Number.parseFloat(rentDoc.room.boardHouseId.waterPrice) *
          Number.parseFloat(waterTotal) +
        Number.parseFloat(rentDoc.room.price);

      billDoc = await Bill.create({
        rent: rentId,
        priceSum,
        electricNumber: electric,
        waterNumber: water,
        oldElectricNumber: OclockPrev.electric,
        oldWaterNumber: OclockPrev.water,
      });

      if (billDoc) {
        return resolve({
          err: 0,
          message: "Created bill!",
          bill: billDoc,
        });
      }

      return resolve({
        err: 2,
        message: "Failed!!! Please try again!",
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const getBillOnMonth = async ({ date = new Date(), boardHouseId }) => {
  return new Promise(async (resolve, reject) => {
    // get all menber rent

    try {
      const memberRentsRes = await rentServices.getAllRentsByBoardHouse(
        boardHouseId
      );

      if (memberRentsRes.err !== 0) {
        return resolve({ err: 2, message: "Error render menber!" });
      }

      const ids = memberRentsRes.data.map((e) => ({
        rentId: e._id,
        roomId: e.room._id,
      }));

      async function testBill(id) {
        return new Promise(async (resolve, reject) => {
          try {
            let findBill = await Bill.findOne({
              rent: id,
              $expr: {
                $and: [
                  {
                    $eq: [
                      { $year: "$createdAt" },
                      new Date(date).getFullYear(),
                    ],
                  },
                  {
                    $eq: [
                      { $month: "$createdAt" },
                      new Date(date).getUTCMonth() + 1,
                    ],
                  }, // Adding 1 since month is 0-indexed
                ],
              },
            })
              .populate({
                path: "rent",
                select: "_id status",
                populate: [
                  {
                    path: "user",
                    select: "_id fullName phone email",
                  },
                  {
                    path: "room",
                    select: "_id number size price",
                  },
                ],
              })
              .sort({ createdAt: -1 });
            if (
              !findBill &&
              new Date(date).getUTCMonth() == new Date().getUTCMonth()
            ) {
              const res = await createBill({ rentId: id });
              if (res.err === 0) {
                findBill = await Bill.findOne({ _id: res.bill._id })
                  .populate({
                    path: "rent",
                    select: "_id status",
                    populate: [
                      {
                        path: "user",
                        select: "_id fullName phone email",
                      },
                      {
                        path: "room",
                        select: "_id number size price",
                      },
                    ],
                  })
                  .sort({ createdAt: -1 });
              }
            }
            resolve(findBill);
          } catch (e) {
            reject(e);
          }
        });
      }

      const billDocs = await Promise.all(
        ids.map(async (v) => {
          let findBill = await testBill(v.rentId);
          return findBill;
        })
      );

      if (billDocs) {
        return resolve({
          err: 0,
          message: "Ok!",
          data: billDocs.filter((e) => e != null),
        });
      }

      return resolve({ err: 1, message: "Error!" });
    } catch (e) {
      // console.log(e);
      reject(e);
    }
  });
};

const getBillByRentId = async ({ rentId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(rentId);
      if (!isValid) {
        return resolve({
          err: 3,
          message: `${_id} invalid!`,
        });
      }
      // get all menber rent
      const bills = await Bill.find({ rent: rentId }).sort({ createdAt: -1 });
      return resolve({ err: 0, message: "OK", bills: bills });
    } catch (e) {
      // console.log(e);
      reject(e);
    }
  });
};

const toggleStatus = async ({ billId, status }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const billDoc = await Bill.findByIdAndUpdate({ _id: billId }, { status });
      return resolve({ err: 0, message: "OK", bills: billDoc });
    } catch (e) {
      // console.log(e);
      reject(e);
    }
  });
};

const checkOutUser = async ({ billId, rentId, date }) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Bill.findByIdAndUpdate({ _id: billId }, { status: 1 });

      await Rent.findByIdAndUpdate(
        { _id: rentId },
        { endDate: new Date(date) }
      );
      return resolve({ err: 0, message: "OK" });
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

const getRoomFromBillID = async ({ billId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const billDoc = await Bill.find({
        _id: billId,
      }).populate({
        path: "rent",
        populate: [
          {
            path: "room",
            select: "number price",
            populate: {
              path: "boardHouseId",
              select: "name address waterPrice electricPrice",
            },
          },
          {
            path: "user",
            select: "fullName email phone",
          },
        ],
      });
      if (billDoc) {
        return resolve({ err: 0, message: "OK", data: billDoc });
      }

      return resolve({
        err: 1,
        message: "Something error at getRoomFromBillID",
      });
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  createBill,
  getBillOnMonth,
  getBillByRentId,
  getRoomFromBillID,
};
