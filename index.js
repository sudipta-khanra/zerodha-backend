require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const { HoldingsModel } = require("./Model/HoldingsModel");
const { PositionsModel } = require("./Model/PositionsModel");
const { OrdersModel } = require("./Model/OrdersModel");
const router = express.Router();
const User = require("./Model/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const { MONGO_URL, PORT } = process.env;
const authRoutes = require("./routes/authRoutes.js");
// const stockRoutes = require("./routes/stocks");

// const PORT = process.env.PORT || 3002;

const app = express();

// ✅ Middlewares first
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    credentials: true,
  })
);
app.use(bodyParser.json());

// ✅ Connect to MongoDB once
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ API Routes
app.get("/allHoldings", async (req, res) => {
  try {
    const orders = await HoldingsModel.find({});

    const holdings = orders.map((order) => {
      const marketPrice = order.price + (Math.random() * 200 - 100); // simulate fluctuation
      const curValue = marketPrice * order.qty;
      const invested = order.price * order.qty;
      const pnl = curValue - invested;

      return {
        name: order.name,
        qty: order.qty,
        avg: order.price, // avg = price of that order
        price: marketPrice.toFixed(2), // current market price
        curValue: curValue.toFixed(2),
        invested: invested.toFixed(2),
        pnl: pnl.toFixed(2),
        net: ((pnl / invested) * 100).toFixed(2), // % change
        day: (Math.random() * 4 - 2).toFixed(2), // mock daily change %
        isLoss: pnl < 0,
      };
    });

    res.json(holdings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/allPositions", async (req, res) => {
  let allPositions = await PositionsModel.find({});
  res.json(allPositions);
});

app.post("/newOrder", async (req, res) => {
  let newOrder = new OrdersModel({
    name: req.body.name,
    qty: req.body.qty,
    price: req.body.price,
    mode: req.body.mode,
  });
  await newOrder.save();
  res.send("Order saved!");
});
app.delete("/deleteAllOrders", async (req, res) => {
  try {
    const result = await OrdersModel.deleteMany({});
    res.send({
      success: true,
      message: `Deleted ${result.deletedCount} orders successfully!`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Error deleting orders" });
  }
});

app.get("/allData", async (req, res) => {
  try {
    const holdingsRaw = await HoldingsModel.find({});

    const holdings = holdingsRaw.map((order) => {
      const marketPrice = order.price + (Math.random() * 200 - 100); // simulate fluctuation
      const curValue = marketPrice * order.qty;
      const invested = order.price * order.qty;
      const pnl = curValue - invested;

      return {
        name: order.name,
        qty: order.qty,
        avg: order.price,
        price: marketPrice.toFixed(2),
        curValue: curValue.toFixed(2),
        invested: invested.toFixed(2),
        pnl: pnl.toFixed(2),
        net: ((pnl / invested) * 100).toFixed(2),
        day: (Math.random() * 4 - 2).toFixed(2),
        isLoss: pnl < 0,
      };
    });

    const orders = await OrdersModel.find({});
    res.json({
      holdings,
      orders,
    });
  } catch (err) {
    console.error("Error in /allData:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/allOrders", async (req, res) => {
  try {
    const orders = await OrdersModel.find({});
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/sellOrder", async (req, res) => {
  try {
    const { name, qty, price } = req.body;

    // Find the order to sell from OrdersModel
    const order = await OrdersModel.findOne({ name, mode: "BUY" });

    if (!order) {
      // Instead of sending an error, return JSON for modal
      return res.json({
        success: false,
        message: "You don't have any BUY order for this stock.",
      });
    }

    if (qty > order.qty) {
      return res.json({
        success: false,
        message: "Not enough quantity in your orders to sell.",
      });
    }

    // Reduce the quantity in the original order
    order.qty -= qty;
    if (order.qty === 0) {
      await OrdersModel.deleteOne({ _id: order._id });
    } else {
      await order.save();
    }

    // Save the sell order
    const sellOrder = new OrdersModel({
      name,
      qty,
      price,
      mode: "SELL",
    });

    await sellOrder.save();

    res.json({
      success: true,
      message: "Sell order processed successfully!",
    });
  } catch (err) {
    console.error("Error in /sellOrder:", err);
    res.json({
      success: false,
      message: "Error processing sell order",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
