
const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const  PORT  = process.env.PORT || 3001;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  app.use('/users', require('./routes/user'));
  app.use('/items', require('./routes/clothingItem'));

  app.use ((req,res, next) => {
    req.user = {
      _id:"665a7bd0bc741bfaa260672e"
    };
    next();
  })
  app.use( (req, res) => {
    res.status(404).json ({
      message: 'Resources not found'
    })
  })
app.listen(PORT, () => {
  console.log(`Server is runnning on port ${PORT}`);
});


