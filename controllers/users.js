const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const NotFoundError = require("../errors/not-found-error");
const BadRequestError = require("../errors/bad-request-error");
const ConflictError = require("../errors/conflict-error");
const NotAuthError = require("../errors/not-auth-error");

const { Ok200, Ok201 } = require("../utils/const");

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(Ok200).send({ data: users }))
    .catch(() => {
      next();
    });
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      res.status(Ok201).send({
        id: user._id, email: user.email, name: user.name, about: user.about, avatar: user.avatar,
      });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError("Переданы некорректные данные при создании пользователя"));
      } else if (err.code === 11000) {
        next(new ConflictError("Пользователь с таким email уже существует"));
      } next(err);
    });
};

const getCurrentUser = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(new Error("NotValidId"))
    .then((user) => {
      res.status(Ok200).send(user);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Передан некорректный id"));
      } else if (err.message === "NotValidId") {
        next(new NotFoundError("Пользователь по указанному id не найден"));
      } next(err);
    });
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(() => new NotFoundError("Пользователь с указанным id не существует"))
    .then((user) => {
      res.status(Ok201).send(user);
    })
    .catch((err) => {
      if ((err.name === "ValidationError") || (err.name === "CastError")) {
        next(new BadRequestError("Переданы некорректные данные при обновлении данных пользователя"));
      } next(err);
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(() => new NotFoundError("Пользователь с указанным id не существует"))
    .then((user) => {
      res.status(Ok201).send(user);
    })
    .catch((err) => {
      if ((err.name === "ValidationError") || (err.name === "CastError")) {
        next(new BadRequestError("Переданы некорректные данные при обновлении аватара"));
      }
      next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select("+password")
    .orFail(new Error("IncorrectEmail"))
    .then((user) => {
      bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            next(new NotAuthError("Указан некорректный Email или пароль"));
          } else {
            const payload = { _id: user._id };
            res.send({
              token: jwt.sign(payload, "randomdata", { expiresIn: "7d" }),
            });
          }
        });
    })
    .catch((err) => {
      if (err.message === "IncorrectEmail") {
        next(new NotAuthError("Указан некорректный Email или пароль"));
      } else {
        next(err);
      }
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
        next(new NotFoundError("Пользователь по указанному id не найден"));
      } else if (err.name === "CastError") {
        next(new BadRequestError("Переданы некорректные данные при обновлении аватара пользователя"));
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
