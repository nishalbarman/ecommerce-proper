const express = require("express");
const router = express.Router();
const Order = require("../../models/order.model");
const getTokenDetails = require("../../helpter/getTokenDetails");
const Center = require("../../models/center.model");
const { default: mongoose } = require("mongoose");
const checkRole = require("../../middlewares");
const shipRocketLogin = require("../../helpter/shipRocketLogin");
const PaymentTransModel = require("../../models/transaction.model");
const OrderGroup = require("../../models/orderGroup.model");

//! ORDER LISTING ROUTE FOR ADMIN AND CENTER
// Update the /list route to support payment status filtering
// router.get("/list", checkRole("admin", "super-admin", "store"), async (req, res) => {
//   try {
//     const searchQuery = req.query;

//     const PAGE = +searchQuery.page || 0;
//     const LIMIT = +searchQuery.limit || 20;
//     const SKIP = +PAGE * LIMIT;

//     const orderStatus = searchQuery?.orderStatus;
//     const paymentStatus = searchQuery?.paymentStatus; // Add payment status filter

//     const role = req?.jwt?.role;

//     const filterQuery = {
//       orderGroupID: { $exists: true, $ne: null },
//       // ...(orderStatus && { orderStatus }), // Existing order status filter
//       ...(role === 2 && { center: req.jwt?.center }),
//     };

//     // Add payment status filter if provided
//     if (paymentStatus && paymentStatus !== "all") {
//       filterQuery.paymentStatus = paymentStatus;
//     }

//     if (orderStatus && orderStatus !== "all") {
//       filterQuery.orderStatus = orderStatus;
//     }

//     const pipeline = [
//       {
//         $match: filterQuery, // Use the updated filter query
//       },
//       {
//         $group: {
//           _id: "$orderGroupID",
//           totalDocumentCount: { $sum: 1 },
//           totalPrice: { $sum: "$price" },
//           paymentTransactionId: { $push: "$paymentTxnId" },
//           paymentStatus: { $first: "$paymentStatus" }, // Include payment status
//           orderStatus: { $first: "$orderStatus" }, // Include payment status
//           orderType: { $push: "$orderType" },
//           orders: { $push: "$$ROOT" },
//           createdAt: { $first: "$createdAt" },
//         },
//       },
//       {
//         $addFields: {
//           createdAt: "$createdAt",
//         },
//       },
//       {
//         $sort: { createdAt: -1 },
//       },
//       {
//         $group: {
//           _id: null,
//           globalTotalDocumentCount: { $sum: 1 },
//           address: { $first: "$orders.address" },
//           user: { $first: "$orders.user" },
//           groupedOrders: { $push: "$$ROOT" },
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "user",
//           foreignField: "_id",
//           pipeline: [
//             { $match: {} },
//             {
//               $project: {
//                 _id: 1,
//                 name: 1,
//                 email: 1,
//                 mobileNo: 1,
//                 isMobileNoVerifed: 1,
//               },
//             },
//           ],
//           as: "user",
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           globalTotalDocumentCount: 1,
//           groupedOrders: {
//             $slice: [
//               {
//                 $map: {
//                   input: "$groupedOrders",
//                   as: "group",
//                   in: {
//                     orderGroupID: "$$group._id",
//                     totalDocumentCount: "$$group.totalDocumentCount",
//                     paymentTransactionId: {
//                       $arrayElemAt: ["$$group.paymentTransactionId", 0],
//                     },
//                     paymentStatus: "$$group.paymentStatus", // Include payment status
//                     orderStatus: "$$group.orderStatus", // Include payment status
//                     orderType: {
//                       $arrayElemAt: ["$$group.orderType", 0],
//                     },
//                     totalPrice: "$$group.totalPrice",
//                     address: {
//                       $arrayElemAt: ["$address", 0],
//                     },
//                     user: { $arrayElemAt: ["$user", 0] },
//                     orders: "$$group.orders",
//                     createdAt: "$$group.createdAt",
//                   },
//                 },
//               },
//               SKIP,
//               LIMIT,
//             ],
//           },
//         },
//       },
//     ];

//     const orderDetails = await Order.aggregate(pipeline);

//     return res.json(
//       orderDetails[0] || { globalTotalDocumentCount: 0, groupedOrders: [] },
//     );
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error!",
//     });
//   }
// });

router.get(
  "/list",
  checkRole("admin", "super-admin", "store"),
  async (req, res) => {
    try {
      const searchQuery = req.query;

      const PAGE = +searchQuery.page || 0;
      const LIMIT = +searchQuery.limit || 20;
      const SKIP = +PAGE * LIMIT;

      const orderStatus = searchQuery?.orderStatus;
      const paymentStatus = searchQuery?.paymentStatus; // Add payment status filter

      if (!req.user._id) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      // const orderStatus = searchQuery?.orderStatus;
      // const paymentStatus = searchQuery?.paymentStatus; // Add payment status filter

      const role = req?.jwt?.role;

      const filterQuery = {
        orderGroupID: { $exists: true, $ne: null },
        // ...(orderStatus && { orderStatus }), // Existing order status filter
        ...(role === 2 && { center: req.jwt?.center }),
      };

      // Add payment status filter if provided
      if (paymentStatus && paymentStatus !== "all") {
        filterQuery.paymentStatus = paymentStatus;
      }

      if (orderStatus && orderStatus !== "all") {
        filterQuery.orderStatus = orderStatus;
      }

      const totalItems = await OrderGroup.countDocuments(filterQuery);

      const orderDetails = await OrderGroup.find(filterQuery)
        .populate("orders")
        .sort({ createdAt: "desc" })
        .skip(SKIP)
        .limit(LIMIT);

      const totalPages = Math.ceil(totalItems / LIMIT);

      const pagination = {
        totalItems,
        totalPages,
        currentPage: PAGE + 1,
        limit: LIMIT,

        hasNextPage: PAGE + 1 < totalPages,
        hasPrevPage: PAGE + 1 > 1,

        nextPage: PAGE + 1 < totalPages ? PAGE + 1 + 1 : null,
        prevPage: PAGE + 1 > 1 ? PAGE + 1 - 1 : null,
      };

      return res.json({ groupOrderData: orderDetails, pagination });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        message: "Internal server error!",
      });
    }
  },
);

router.get(
  "/list-group/:productType",
  checkRole("user", "admin", "super-admin", "store"),
  async (req, res) => {
    try {
      const searchQuery = req.query;

      const PAGE = +searchQuery.page || 0;
      const LIMIT = +searchQuery.limit || 20;
      const SKIP = +PAGE * LIMIT;

      const orderStatus = searchQuery?.orderStatus;
      const paymentStatus = searchQuery?.paymentStatus; // Add payment status filter

      if (!req.user._id) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      const filterQuery = {
        orderGroupID: { $exists: true, $ne: null },
        user: req.user._id,
      };

      // Add payment status filter if provided
      if (paymentStatus && paymentStatus !== "all") {
        filterQuery.paymentStatus = paymentStatus;
      }

      if (orderStatus && orderStatus !== "all") {
        filterQuery.orderStatus = orderStatus;
      }

      const totalItems = await OrderGroup.countDocuments(filterQuery);

      const orderDetails = await OrderGroup.find(filterQuery)
        .populate("orders")
        .sort({ createdAt: "desc" })
        .skip(SKIP)
        .limit(LIMIT);

      const totalPages = Math.ceil(totalItems / LIMIT);

      const pagination = {
        totalItems,
        totalPages,
        currentPage: PAGE + 1,
        limit: LIMIT,

        hasNextPage: PAGE + 1 < totalPages,
        hasPrevPage: PAGE + 1 > 1,

        nextPage: PAGE + 1 < totalPages ? PAGE + 1 + 1 : null,
        prevPage: PAGE + 1 > 1 ? PAGE + 1 - 1 : null,
      };

      return res.json({ data: orderDetails, pagination });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        message: "Internal server error!",
      });
    }
  },
);

router.get(
  "/details/:orderGroupID",
  checkRole("admin", "super-admin", "store"),
  async (req, res) => {
    try {
      const orderGroupID = req.params?.orderGroupID;

      const role = req.jwt?.role;

      const orderDetails = await OrderGroup.findOne({
        orderGroupID: orderGroupID,
        ...(role === 2 && { center: req.jwt?.center }),
      }).populate("orders");

      console.log("Order Details --> ", orderDetails);

      return res.json({ orderGroup: orderDetails });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        message: "Internal server error!",
      });
    }
  },
);

// router.get("/details/:orderGroupID", checkRole("admin", "super-admin", "store"), async (req, res) => {
//   try {
//     const orderGroupID = req.params?.orderGroupID;

//     const role = req.jwt?.role;

//     const pipeline = [
//       {
//         $match: {
//           orderGroupID: orderGroupID,
//           ...(role === 2 && { center: req.jwt?.center || "_blank" }),
//         },
//       },
//       {
//         $group: {
//           _id: "$orderGroupID",
//           totalDocumentCount: { $sum: 1 },
//           totalPrice: { $sum: "$price" },
//           paymentTransactionId: { $push: "$paymentTxnId" },
//           orderType: { $push: "$orderType" },
//           orders: { $push: "$$ROOT" },
//           createdAt: { $first: "$createdAt" }, // Extract createdAt from the first order in each group
//         },
//       },
//       {
//         $addFields: {
//           createdAt: "$createdAt", // Add createdAt field to the grouped document
//         },
//       },

//       {
//         $group: {
//           _id: null,
//           globalTotalDocumentCount: { $sum: 1 },
//           address: { $first: "$orders.address" },
//           user: { $first: "$orders.user" },
//           groupedOrders: { $push: "$$ROOT" },
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "user",
//           foreignField: "_id",
//           pipeline: [
//             { $match: {} },
//             {
//               $project: {
//                 _id: 1,
//                 name: 1,
//                 email: 1,
//                 mobileNo: 1,
//                 isMobileNoVerifed: 1,
//               },
//             },
//           ],
//           as: "user",
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           globalTotalDocumentCount: 1,
//           groupedOrders: {
//             $map: {
//               input: "$groupedOrders",
//               as: "group",
//               in: {
//                 orderGroupID: "$$group._id",
//                 totalDocumentCount: "$$group.totalDocumentCount",
//                 paymentTransactionId: {
//                   $arrayElemAt: ["$$group.paymentTransactionId", 0],
//                 },
//                 orderType: {
//                   $arrayElemAt: ["$$group.orderType", 0],
//                 },
//                 totalPrice: "$$group.totalPrice",
//                 address: {
//                   $arrayElemAt: ["$address", 0],
//                 },
//                 user: { $arrayElemAt: ["$user", 0] },
//                 orders: "$$group.orders",
//                 createdAt: "$$group.createdAt", // Include createdAt field
//               },
//             },
//           },
//         },
//       },
//     ];

//     const orderDetails = await Order.aggregate(pipeline);

//     console.log("Order Details --> ", orderDetails);

//     return res.json(orderDetails[0].groupedOrders[0]);
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error!",
//     });
//   }
// });

//! Order details for normal user, orders can be viewed with the transaction id

router.get(
  "/view/:paymentTransactionId",
  checkRole("user", "admin", "super-admin", "store"),
  async (req, res) => {
    try {
      const paymentTransactionId = req.params?.paymentTransactionId;

      const orderDetails = await PaymentTransModel.findOne({
        paymentTransactionID: paymentTransactionId,
      }).populate("orders");

      return res.json({ orderDetails });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        message: "Internal server error!",
      });
    }
  },
);

//! Order details for normal user, orders can be viewed with the transaction id
router.get(
  "/view-orders/:orderGroupId",
  checkRole("user", "admin", "super-admin", "store"),
  async (req, res) => {
    try {
      const orderGroupId = req.params?.orderGroupId;

      const orderDetails = await Order.find({
        orderGroupID: orderGroupId,
      });

      return res.json({ data: orderDetails });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        message: "Internal server error!",
      });
    }
  },
);

//! Order details for normal user, orders can be viewed with the transaction id
router.get(
  "/view-group-order/:orderGroupId",
  checkRole("user", "admin", "super-admin", "store"),
  async (req, res) => {
    try {
      const orderGroupId = req.params?.orderGroupId;

      const orderGroup = await OrderGroup.findOne({
        orderGroupID: orderGroupId,
      });

      return res.json({ data: orderGroup });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        message: "Internal server error!",
      });
    }
  },
);

//! ORDER LISTING ROUTE FOR NORMAL USERS
router.get(
  "/l/:productType",
  checkRole("user", "admin", "super-admin", "store"),
  async (req, res) => {
    try {
      const searchQuery = req.query;

      const productType = req.params?.productType;

      console.log(productType);

      const QUERY = searchQuery.q;
      const PAGE = searchQuery.page || 0;
      const LIMIT = searchQuery.limit || 20;
      const SKIP = PAGE * LIMIT;

      let orderDetails = undefined;
      let totalPages = 0;

      const filterQuery = {
        user: req.user._id,
        orderType: productType,
      };

      if (!!QUERY) {
        filterQuery["$text"] = { $search: QUERY };
      }

      let countDocuments = await Order.countDocuments(filterQuery);

      if (productType === "buy") {
        orderDetails = await Order.find(filterQuery)
          .sort({ createdAt: "desc" })
          .skip(SKIP)
          .limit(LIMIT)
          .populate("orderGroupID");
      } else {
        orderDetails = await Order.find(filterQuery)
          .sort({ createdAt: "desc" })
          .skip(SKIP)
          .limit(LIMIT);
      }

      totalPages = Math.ceil(countDocuments / LIMIT);

      return res.json({
        data: orderDetails,
        totalPage: totalPages,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error!",
      });
    }
  },
);

//! ORDER STATUS UPDATING ROUTE CAN BE USED BY ADMIN AND CENTER
router.patch(
  "/update-status",
  checkRole("admin", "super-admin", "store"),
  async (req, res) => {
    try {
      const order = req.body?.order;
      const orderStatus = req.body?.orderStatus;
      const trackingUrl = req.body?.trackingUrl;

      if (!order || !orderStatus) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      console.log("Order tracking id: ", trackingUrl);

      const role = req?.jwt?.role;
      const center = req?.jwt?.center;

      let orderFilter = {};

      //! FROM admin panel we can get an array or signle group id. if admin selects multiple orders updation will happen based on order _id otherwise it will happen based on orderGroupID

      if (Array.isArray(order)) {
        orderFilter = { _id: { $in: order } };
      } else {
        orderFilter = { orderGroupID: order };
      }

      orderFilter.orderStatus = { $ne: "Cancelled" };

      if (role === 2) {
        // center
        if (!center) {
          return res
            .status(400)
            .json({ message: "No center available for given user ID" });
        }
        orderFilter.center = center;
      }

      const status = await Order.updateMany(orderFilter, {
        $set: { orderStatus, trackingUrl: trackingUrl || "" },
      });

      const groupStatus = await OrderGroup.findOneAndUpdate(
        { orderGroupID: order },
        { $set: { orderStatus: orderStatus, trackingUrl: trackingUrl || "" } },
        { new: true },
      );

      return res.json({
        message: "Order status updated",
        modifiedCount: status.modifiedCount,
        groupStatus,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        message: "Internal server error!",
      });
    }
  },
);

//! ORDER CANCELLATION ROUTE CAN BE USED BY ADMIN AND NORMAL USERS
router.patch("/cancel", checkRole(1, 0), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderGroupId } = req.body;
    const user = req.user;

    if (!orderGroupId) {
      return res.status(400).json({
        status: false,
        message: "Order Group ID is required!",
      });
    }

    // Base filter
    const orderFilter = {
      orderGroupID: orderGroupId,
    };

    // Role based filtering
    if (user.role === 0) {
      // Normal user
      orderFilter.user = user._id;
      orderFilter.orderStatus = {
        $in: ["On Hold", "On Progress", "Accepted"],
      };
    }

    if (user.role === 2) {
      // Center
      if (!user.center) {
        return res.status(400).json({
          status: false,
          message: "No center assigned to this user",
        });
      }

      orderFilter.center = user.center;
      orderFilter.orderStatus = {
        $ne: "Cancelled",
      };
    }

    // Check if order exists
    const existingOrder = await Order.findOne(orderFilter)
      .session(session)
      .select("_id");

    if (!existingOrder) {
      await session.abortTransaction();
      session.endSession();

      return res.status(404).json({
        status: false,
        message: "Order not found or cannot be cancelled",
      });
    }

    // Update Orders
    await Order.updateMany(
      orderFilter,
      { $set: { orderStatus: "Cancelled" } },
      { session },
    );

    // Update OrderGroup
    await OrderGroup.updateOne(
      { orderGroupID: orderGroupId },
      { $set: { orderStatus: "Cancelled" } },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return res.json({
      status: true,
      message: "Order Cancelled Successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

//! CANCEL INDIVIDUAL ORDER ITEM ROUTE
router.patch("/cancel-item", checkRole(1, 0), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderItemId, orderGroupID } = req.body;
    const user = req.user;

    if (!orderItemId || !orderGroupID) {
      return res.status(400).json({
        status: false,
        message: "Order Item ID and Order Group ID are required!",
      });
    }

    if (user.role === 2 && !user.center) {
      return res.status(400).json({
        status: false,
        message: "No center assigned to this user",
      });
    }

    // Build filter
    const orderFilter = {
      _id: orderItemId,
      orderGroupID: orderGroupID,
      orderStatus: {
        $in: ["On Hold", "On Progress", "Accepted"],
      },
    };

    if (user.role === 0) {
      orderFilter.user = user._id;
    }

    if (user.role === 2) {
      orderFilter.center = user.center;
    }

    // Cancel single item
    const updateResult = await Order.updateOne(
      orderFilter,
      { $set: { orderStatus: "Cancelled" } },
      { session },
    );

    if (updateResult.modifiedCount === 0) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        status: false,
        message: "Order cannot be cancelled or not found",
      });
    }

    // Count total items in group
    const totalItems = await Order.countDocuments(
      { orderGroupID: orderGroupID },
      { session },
    );

    // Count cancelled items
    const cancelledItems = await Order.countDocuments(
      {
        orderGroupID: orderGroupID,
        orderStatus: "Cancelled",
      },
      { session },
    );

    // If all items cancelled → cancel group
    if (totalItems === cancelledItems) {
      await OrderGroup.updateOne(
        { orderGroupID: orderGroupID },
        { $set: { orderStatus: "Cancelled" } },
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      status: true,
      message: "Order Item Cancelled Successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Internal server error: ", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error!",
    });
  }
});

//! ORDER CHART DATA -- CAN BE USED BY ADMIN AND CENTER
router.get("/get-order-chart-data", checkRole(1), async (req, res) => {
  try {
    const year = parseInt(req.query?.year);
    const month = parseInt(req.query?.month);

    const pipeline = [
      // Stage 1: Match orders with specific statuses
      {
        $match: {
          $or: [
            { orderStatus: "Delivered" },
            { orderStatus: "Cancelled" },
            { orderStatus: "Rejected" },
          ],
        },
      },
      // Stage 2: Group by updated date and count orders for each status
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" },
            day: { $dayOfMonth: "$updatedAt" },
          },
          deliveredCount: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "Delivered"] }, 1, 0] },
          },
          cancelledCount: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "Cancelled"] }, 1, 0] },
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "Rejected"] }, 1, 0] },
          },
        },
      },
      // Stage 3: Project to format date and rename fields
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%B %d, %Y",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day",
                },
              },
            },
          },
          deliveredCount: 1,
          cancelledCount: 1,
          rejectedCount: 1,
          pendingCount: 1,
        },
      },
      // Stage 4: Sort by date
      {
        $sort: { date: 1 },
      },
      // Stage 5: Group to calculate totals
      {
        $group: {
          _id: null,
          totalDeliveredOrders: { $sum: "$deliveredCount" },
          totalCancelledOrders: { $sum: "$cancelledCount" },
          totalRejectedOrders: { $sum: "$rejectedCount" },
          chartData: { $push: "$$ROOT" },
        },
      },
      // Stage 6: Project to reshape output
      {
        $project: {
          _id: 0,
          totalDeliveredOrders: 1,
          totalCancelledOrders: 1,
          totalRejectedOrders: 1,
          totalPendingOrders: {
            $subtract: [
              {
                $sum: [
                  "$totalDeliveredOrders",
                  "$totalCancelledOrders",
                  "$totalRejectedOrders",
                ],
              },
              "$totalDeliveredOrders",
            ],
          },
          chartData: 1,
        },
      },
    ];

    const data = await Order.aggregate(pipeline);

    return res.status(200).json(data[0]);
  } catch (error) {
    console.log(error);
    if (error instanceof mongoose.Error && error?.errors) {
      const errArray = Object.values(error.errors).map(
        (properties) => properties.message,
      );

      return res.status(400).json({
        message: errArray.join(", "),
      });
    }
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.get(
  "/admin/reset-order",
  checkRole("admin", "super-admin", "store"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { orderGroupID } = req.body;
      const user = req.user;

      if (!orderGroupID) {
        return res.status(400).json({
          status: false,
          message: "Order Group ID are required!",
        });
      }

      if (user.role === 2 && !user.center) {
        return res.status(400).json({
          status: false,
          message: "No center assigned to this user",
        });
      }

      // Build filter
      const orderFilter = {
        orderGroupID: orderGroupID,
        orderStatus: {
          $in: ["Cancelled", "Unable to Fulfill"],
        },
      };

      if (user.role === 0) {
        orderFilter.user = user._id;
      }

      if (user.role === 2) {
        orderFilter.center = user.center;
      }

      // Cancel single item
      const updateResult = await OrderGroup.findOneAndUpdate(
        orderFilter,
        { $set: { orderStatus: "Accepted" } },
        { session },
      );

      const result = await Order.updateMany(
        orderFilter,
        { $set: { orderStatus: "Accepted" } },
        { session },
      );

      if (updateResult.modifiedCount === 0 || result.modifiedCount === 0) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          status: false,
          message: "Order cannot be reset, please try again.",
        });
      }

      await session.commitTransaction();
      session.endSession();

      return res.json({
        status: true,
        message: "Order Group Reset Successful",
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error("Internal server error: ", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error!",
      });
    }
  },
);

//! RENT ORDER PLACING ROUTE FOR USER
router.use("/renting", require("./rent-order.routes"));

module.exports = router;
