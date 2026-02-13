// routes/dashboard.routes.js
const express = require("express");
const router = express.Router();
const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const PaymentTransModel = require("../../models/transaction.model");
const checkRole = require("../../middlewares");
const mongoose = require("mongoose");

// Dashboard statistics
router.get("/stats", checkRole(1, 2), async (req, res) => {
  try {
    // Calculate date ranges
    const currentDate = new Date();
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);

    // Revenue (total paid transactions)
    const revenueData = await PaymentTransModel.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          lastMonthRevenue: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", lastMonthDate] },
                "$totalPrice",
                0,
              ],
            },
          },
        },
      },
    ]);

    // Weekly sales (paid transactions in last 7 days)
    const weeklySalesData = await PaymentTransModel.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          createdAt: { $gte: lastWeekDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    // Total orders
    const ordersData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          lastMonthOrders: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", lastMonthDate] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Total users
    const usersData = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          lastMonthUsers: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", lastMonthDate] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Prepare response
    const response = {
      revenue: {
        current: revenueData[0]?.totalRevenue || 0,
        lastMonth: revenueData[0]?.lastMonthRevenue || 0,
        change: calculatePercentageChange(
          revenueData[0]?.lastMonthRevenue || 0,
          revenueData[0]?.totalRevenue || 0
        ),
      },
      weeklySales: {
        current: weeklySalesData[0]?.total || 0,
        // You might want to compare with previous week
        change: 0, // Implement comparison logic if needed
      },
      totalOrders: {
        current: ordersData[0]?.totalOrders || 0,
        lastMonth: ordersData[0]?.lastMonthOrders || 0,
        change: calculatePercentageChange(
          ordersData[0]?.lastMonthOrders || 0,
          ordersData[0]?.totalOrders || 0
        ),
      },
      totalUsers: {
        current: usersData[0]?.totalUsers || 0,
        lastMonth: usersData[0]?.lastMonthUsers || 0,
        change: calculatePercentageChange(
          usersData[0]?.lastMonthUsers || 0,
          usersData[0]?.totalUsers || 0
        ),
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

// Add to dashboard.routes.js

// Revenue chart data (monthly)
router.get("/revenue-chart", checkRole(1, 2), async (req, res) => {
  try {
    const { year } = req.query;

    const pipeline = [
      {
        $match: {
          paymentStatus: "Paid",
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${parseInt(year) + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          totalRevenue: 1,
        },
      },
      {
        $sort: { month: 1 },
      },
    ];

    const data = await PaymentTransModel.aggregate(pipeline);

    // Format data for chart
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const chartData = months.map((month, index) => {
      const monthData = data.find((d) => d.month === index + 1);
      return {
        month,
        revenue: monthData ? monthData.totalRevenue : 0,
      };
    });

    return res.status(200).json(chartData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Orders chart data (monthly)
router.get("/orders-chart", checkRole(1, 2), async (req, res) => {
  try {
    const { year } = req.query;

    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${parseInt(year) + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          count: 1,
        },
      },
      {
        $sort: { month: 1 },
      },
    ];

    const data = await Order.aggregate(pipeline);

    // Format data for chart
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const chartData = months.map((month, index) => {
      const monthData = data.find((d) => d.month === index + 1);
      return {
        month,
        orders: monthData ? monthData.count : 0,
      };
    });

    return res.status(200).json(chartData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Users chart data (monthly)
router.get("/users-chart", checkRole(1, 2), async (req, res) => {
  try {
    const { year } = req.query;

    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${parseInt(year) + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          count: 1,
        },
      },
      {
        $sort: { month: 1 },
      },
    ];

    const data = await User.aggregate(pipeline);

    // Format data for chart
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const chartData = months.map((month, index) => {
      const monthData = data.find((d) => d.month === index + 1);
      return {
        month,
        users: monthData ? monthData.count : 0,
      };
    });

    return res.status(200).json(chartData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Add to dashboard.routes.js

// Recent transactions
router.get("/recent-transactions", checkRole(1, 2), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const transactions = await PaymentTransModel.find({ paymentStatus: "Paid" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("user", "name email")
      .populate("order");

    return res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// New registrations
router.get("/new-registrations", checkRole(1, 2), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("name email mobileNo createdAt")
      .populate("role", "roleName");

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = router;
