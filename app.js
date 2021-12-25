const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const usersRouter = require("./routes/users");
const cardsRouter = require("./routes/cards");
const { createUser, login } = require("./controllers/users");

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = {
    _id: "61c0caee9cad5f835345db86",
  };

  next();
});

app.use("/", usersRouter);
app.use("/", cardsRouter);

app.post("/signin", login);
app.post("/signup", createUser);

app.use("*", (req, res) => {
  res.status(404).send({ message: "Несуществующий адрес" });
});

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
