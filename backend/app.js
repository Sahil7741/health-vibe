// Imported Required Frameworks And Modules and created Express App Instance
import express from "express";
const app = express();
import userRoutes from "./routes/userRoutes.js";
// const productRoutes = require("../backend/routes/productRoutes");
// const paymentRoutes = require("../backend/routes/paymentRoutes");
import connectDb from "./config/dbconnect.js";

// Imported all Required Middlewares
// const cors = require("cors");
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

// Defined Port for server
const port = process.env.PORT || 3000;

const startServer = async () => {
  if (await connectDb()) {
    try {
      // Start the Express server and listen on the defined port
      app.listen(port, () => {
        console.log(
          `\nSuccessfully Connected to Database...\nListening to Requests at Port: ${port}\nServer Started...`
        );
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log("Server Error");
  }
};

// Start Server
startServer();

// Middleware for handling CORS
// app.use(cors({ origin: process.env.FRONTEND , credentials: true }));

// Middleware for parsing cookies
app.use(cookieParser());

// Middleware for parsing JSON and URL-encoded data in request bodies
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.json()), app.use(express.urlencoded({ extended: true }));

// Middleware to log information about incoming requests
app.use((req, res, next) => {
  console.log("\nNew Request Made :");
  console.log("Host : ", req.hostname);
  console.log("Path : ", req.path);
  console.log("Method : ", req.method);
  next();
});

// Using defined routes for handling various API endpoints
app.use(userRoutes);
// app.use(productRoutes);
// app.use(paymentRoutes);
