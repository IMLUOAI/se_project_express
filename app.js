const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const { NOT_FOUND } = require("./utils/errors");

const PORT = process.env.PORT || 3001;
const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require('./routes/index'));

app.use((_, res) => {
  res.status(NOT_FOUND).json({
    message: "Resource not found",
  });
});

app.listen(PORT, () => {
  // console.log(`Server is runnning on port ${PORT}`);
});
