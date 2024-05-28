
const path = require('path');
const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { PORT = 3001, BASE_PATH } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  });
  app.use('/users', require('./routes/user'));
  app.use('/items', require('/routes/clothingItem'));
  app.use ((req,res, next) => {
    req.user = {
      _id:""
    };
    next();
  })
  app.use( (req, res) => {
    res.status(404).json ({
      message: 'Resources not found'
    })
  })
app.listen(PORT, () => {
  console.log("Server is runnning on port ${PORT}");
  console.log(BASE_PATH);
});
