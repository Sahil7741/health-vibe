const express = require("express");
const app = express();
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const classRoutes = require("./routes/classRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const cartRoutes = require("./routes/cartRoutes");
const authRoutes = require("./routes/authRoutes");
const otherRoutes = require("./routes/otherRoutes");

const { connectToDatabase } = require("./config/db");

const cors = require("cors");

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function run() {
  try {
    await connectToDatabase();

    // Listen
    app.listen(port, () => {
      console.log(`SERVER IS RUNNING ON PORT ${port}`);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.use((req, res, next) => {
      console.log("\nNew Request Made :");
      console.log("Host : ", req.hostname);
      console.log("Path : ", req.path);
      console.log("Method : ", req.method);
      next();
    });

    app.use(authRoutes);
    app.use(cartRoutes);
    app.use(classRoutes);
    app.use(otherRoutes);
    app.use(paymentRoutes);
    app.use(userRoutes);

  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Yoga Master Server is running!");
});
