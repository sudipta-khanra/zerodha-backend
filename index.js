require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const auth = require("./middleware/auth"); // your JWT auth middleware
const { HoldingsModel } = require("./Model/HoldingsModel");
const { OrdersModel } = require("./Model/OrdersModel");
const { PositionsModel } = require("./Model/PositionsModel");
const jwt = require("jsonwebtoken");
const { MONGO_URL, PORT } = process.env;
const app = express();

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
app.use("/api/auth", authRoutes);

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/allHoldings", async (req, res) => {
  try {
    const allOrders = await HoldingsModel.find();
    const allHoldings = allOrders.map((order) => {
      const marketPrice = order.price + (Math.random() * 200 - 100);
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
        user: order.user,
      };
    });

    let userHoldings = [];

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userOrders = allOrders.filter(
          (order) => order.user.toString() === decoded.id
        );

        userHoldings = userOrders.map((order) => {
          const marketPrice = order.price + (Math.random() * 200 - 100);
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
      } catch (err) {
        console.error("Token error:", err.message);
      }
    }

    res.json({ allHoldings, userHoldings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/allPositions", async (req, res) => {
  try {
    const positions = await PositionsModel.find();
    res.json(positions);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

app.get("/allOrders", auth, async (req, res) => {
  try {
    const orders = await OrdersModel.find({ user: req.user.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/newOrder", auth, async (req, res) => {
  try {
    const newOrder = new OrdersModel({
      user: req.user.id,
      name: req.body.name,
      qty: req.body.qty,
      price: req.body.price,
      mode: req.body.mode,
    });
    await newOrder.save();
    res.json({ message: "Order saved!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/sellOrder", auth, async (req, res) => {
  try {
    const { name, qty, price } = req.body;

    const order = await OrdersModel.findOne({
      user: req.user.id,
      name,
      mode: "BUY",
    });

    if (!order) {
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

    order.qty -= qty;
    if (order.qty === 0) {
      await OrdersModel.deleteOne({ _id: order._id });
    } else {
      await order.save();
    }

    const sellOrder = new OrdersModel({
      user: req.user.id,
      name,
      qty,
      price,
      mode: "SELL",
    });

    await sellOrder.save();

    res.json({ success: true, message: "Sell order processed successfully!" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error processing sell order" });
  }
});

app.delete("/deleteAllOrders", auth, async (req, res) => {
  try {
    const result = await OrdersModel.deleteMany({ user: req.user.id });
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} orders successfully!`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting orders" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
