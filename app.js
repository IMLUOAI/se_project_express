const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { NOT_FOUND, INTERNAL_SERVER_ERROR } = require('./utils/errors');
const { createUser, login } = require('./controllers/user');
const auth = require('./middlewares/auth');
const cors = require("cors");


const PORT = process.env.PORT || 3001;
const app = express();

mongoose .connect("mongodb://127.0.0.1:27017/wtwr_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/signin', login);
app.post('/signup', createUser);
app.use('/users', auth, require('./routes/user'));
app.use('/items', auth, require('./routes/clothingItem'));


app.use((_, res) => {
  res.status(NOT_FOUND).json({
    message: 'Resource not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server is runnning on port ${PORT}`);
});
