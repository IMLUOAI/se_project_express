const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { INTERNAL_SERVER_ERROR, NOT_FOUND } = require('./utils/errors');
const User = require('./models/user');
const  PORT  = process.env.PORT || 3001;
const app = express();


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
  app.use('/items', require('./routes/clothingItem'));

  app.use( (_, res) => {
    res.status(NOT_FOUND).json ({
      message: 'Resources not found'
    })
  })
app.listen(PORT, () => {
  // console.log(`Server is runnning on port ${PORT}`);
});

// app.get('/users', (req, res) => {
//   User.find({})
//   .then(users => {
//     res.status(200).json(users);
//   })
//   .catch(() => {
//     res.status(INTERNAL_SERVER_ERROR).send({message: 'Internal server error'});
//   })
// })
