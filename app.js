const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const errorHandler = require('./middlewares/error-handler')
const { errors } = require('celebrate');
const PORT = process.env.PORT || 3001;
const app = express();
const { requestLogger, errorLogger } = require('./middlewares/logger');


mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use(requestLogger);
app.use(require("./routes/index"));

//enabling the error logger
app.use(errorLogger);


// Celebrate error handler
app.use(errors());

//Centralized error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is runnning on port ${PORT}`);
});
