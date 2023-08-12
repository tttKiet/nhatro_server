import { Bill, Rent, Oclock, BoardHouse } from "../app/Models";
import { rentServices } from "../services";
import * as dotenv from "dotenv";
dotenv.config();

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
          Number.parseFloat(electric) -
            Number.parseFloat(OclockPrev.oldElectric) || 0;
        waterTotal =
          Number.parseFloat(water) - Number.parseFloat(OclockPrev.oldWater) ||
          0;

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

        electric && (opOclock.electric = electric);
        water && (opOclock.water = water);
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
        ? electric - Number.parseFloat(OclockPrev.electric)
        : 0;
      waterTotal = water ? water - Number.parseFloat(OclockPrev.water) : 0;

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
      console.log(e);
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
        const res = await createBill({ rentId: id });
        console.log("res", res);
        let bill;
        if (res.err === 0) {
          res.bill;

          bill = await Bill.findOne({ _id: res.bill._id })
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
        return bill || null;
      }

      const billDocs = await Promise.all(
        ids.map(async (v) => {
          return (
            (await Bill.findOne({
              rent: v.rentId,
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
              .sort({ createdAt: -1 })) ||
            (await testBill(v.rentId)) ||
            "Erorr"
          );
        })
      );
      console.log("billDocs", billDocs);

      if (billDocs) {
        return resolve({ err: 0, message: "Ok!", data: billDocs });
      }

      return resolve({ err: 1, message: "Error!" });
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

export default { createBill, getBillOnMonth };
