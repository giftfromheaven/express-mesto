const express = require("express");
const mongoose = require("mongoose");
const { errors } = require("celebrate");
const { celebrate, Joi } = require("celebrate");
const bodyParser = require("body-parser");
const errorHandler = require("./middlewares/errors");
const usersRouter = require("./routes/users");
const cardsRouter = require("./routes/cards");
const auth = require("./middlewares/auth");
const { createUser, login } = require("./controllers/users");

const NotFoundError = require("./errors/not-found-error");

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/signin", celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(5),
  }),
}), login);
app.post("/signup", celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/^https?:\/\/(www.)?[a-zA-Z0-9-.]+\.[a-zA-Z]{2,}([a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+)*#*$/),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(5),
  }),
}), createUser);

app.use(auth);

app.use("/", usersRouter);
app.use("/", cardsRouter);

app.use("*", () => {
  throw new NotFoundError("Несуществующий адрес.");
});

app.use(errors());

app.use(errorHandler);

async function start() {
  try {
    mongoose.connect("mongodb://localhost:27017/mestodb", {
      useNewUrlParser: true,
    });
    app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
  } catch (err) {
    console.log(`Server error, ${err.message}`);
  }
}

start();
