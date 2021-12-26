const express = require("express");
const mongoose = require("mongoose");
const { errors } = require("celebrate");
const bodyParser = require("body-parser");
const errorHandler = require("./middlewares/errors");
const usersRouter = require("./routes/users");
const cardsRouter = require("./routes/cards");
const auth = require("./middlewares/auth");

const Error404 = 404;

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(auth);

app.use("/", usersRouter);
app.use("/", cardsRouter);

app.use("*", (req, res) => {
  res.status(Error404).send({ message: "Несуществующий адрес" });
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
