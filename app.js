require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const { errors } = require('celebrate');

const errorHandler = require('./middlewares/error-handler')

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wtwr_db";
const app = express();
const { requestLogger, errorLogger } = require('./middlewares/logger');


mongoose.set("strictQuery", false);
mongoose.connect(MONGODB_URI);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN
      ? process.env.CLIENT_ORIGIN.split(",")
      : "*",
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use(requestLogger);
app.use(require("./routes/index"));


// enabling the error logger
app.use(errorLogger);


// Celebrate error handler
app.use(errors());


// Centralized error handler
app.use(errorHandler);

app.listen(PORT, () => {
  // console.log(`Server is runnning on port ${PORT}`);
});
