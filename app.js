const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { NOT_FOUND } = require('./utils/errors');
const { createUser, login } = require('./controllers/auth');
const auth = require('./middlewares/auth');
const { createClothingItem } = require("./controllers/clothingItem");

const  PORT  = process.env.PORT || 3001;
const app = express();

app.post('/signin', login);
app.post('/signup', createUser);

app.use(auth);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

mongoose .connect("mongodb://127.0.0.1:27017/wtwr_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

app.use ((req, _, next) => {
  req.user = {
    _id:"665c9ff5f6211d5872dcedb3"
  };
  next();
});

  app.use('/users', require('./routes/user'));
  app.use('/items', auth, createClothingItem);

  app.use( (_, res) => {
    res.status(NOT_FOUND).json ({
      message: 'Resources not found'
    })
  })


app.listen(PORT, () => {
  console.log(`Server is runnning on port ${PORT}`);
});
