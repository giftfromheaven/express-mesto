const User = require("../models/user");

const getUsers = (res) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch((err) => res.status(500).send({ message: `Произошла ошибка: ${err.message} ` }));
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(201).send({ data: user }))
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

module.exports = {
  getUsers,
  getCurrentUser,
  createUser,
  updateUser,
  updateAvatar,
};
