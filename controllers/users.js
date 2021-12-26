const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const Error400 = 400;
const Error404 = 404;
const Error409 = 409;
const Ok200 = 200;
const Create201 = 201;

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка" }));
};

const createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      res.status(200).send({
        id: user._id, email: user.email, name: user.name, abote: user.aboute, avatar: user.avatar,
      });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({ message: "Переданы некорректные данные при создании пользователя" });
      } else {
        res.status(500).send({ message: "На сервере произошла ошибка при создании пользователя" });
      }
    });
};

const getCurrentUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(new Error("NotValidId"))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(400).send({ message: "Передан некорректный id" });
      } else if (err.message === "NotValidId") {
        res.status(404).send({ message: "Пользователь по указанному id не найден" });
      } else {
        res.status(500).send({ message: "На сервере произошла ошибка при получении id текущего пользователя" });
      }
    });
};

const updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(new Error("NotValidId"))
    .then((user) => {
      res.status(201).send(user);
    })
    .catch((err) => {
      if (err.message === "NotValidId") {
        res.status(404).send({ message: "Пользователь по указанному id не найден при обновлении данных" });
      } else if ((err.name === "ValidationError") || (err.name === "CastError")) {
        res.status(400).send({ message: "Переданы некорректные данные при обновлении данных пользователя" });
      } else {
        res.status(500).send({ message: "На сервере произошла ошибка при обновлении данных пользователя" });
      }
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(new Error("NotValidId"))
    .then((user) => {
      res.status(201).send(user);
    })
    .catch((err) => {
      if (err.message === "NotValidId") {
        res.status(404).send({ message: "Пользователь по указанному id не найден при обновлении аватара" });
      } else if ((err.name === "ValidationError") || (err.name === "CastError")) {
        res.status(400).send({ message: "Переданы некорректные данные при обновлении аватара" });
      } else {
        res.status(500).send({ message: "На сервере произошла ошибка при обновлении аватара" });
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const payload = { _id: user._id };
      res.send({
        token: jwt.sign(payload, "randomdata", { expiresIn: "7d" }),
      });
    })
    .catch((err) => {
      next(err);
    });
};

const getUserMe = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new Error("NotValidId"))
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.message === "NotValidId") {
        res.status(404).send({ message: "404 — Пользователь по указанному _id не найден." });
      } else if (err.name === "CastError") {
        res.status(400).send({ message: "400 — Переданы некорректные данные при обновлении аватара пользователя" });
      }
      next(err);
    });
};

module.exports = {
  getUsers,
  getCurrentUser,
  createUser,
  updateUser,
  updateAvatar,
  login,
  getUserMe,
};
