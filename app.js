const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./utils/config');
const { NOT_FOUND } = require('./utils/errors');
const { createUser, login } = require('./controllers/user');
const auth = require('./middlewares/auth');
const cors = require("cors");


const  PORT  = process.env.PORT || 3001;
const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/signin', login);
app.post('/signup', createUser);

  app.use(auth);
  app.use('/users', require('./routes/user'));
  app.use('/items', require('./routes/clothingItem'));

  app.use( (_, res) => {
    res.status(NOT_FOUND).json ({
      message: 'Resources not found'
    })
  })

  mongoose .connect("mongodb://127.0.0.1:27017/wtwr_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

app.listen(PORT, () => {
  console.log(`Server is runnning on port ${PORT}`);
});
