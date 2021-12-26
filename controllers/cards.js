const Card = require("../models/user");

const Error500 = 500;
const Error400 = 400;
const Error403 = 403;
const Error404 = 404;
const Ok200 = 200;
const Create201 = 201;

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(Ok200).send({ cards }))
    .catch(() => res.status(Error500).send({ message: "На сервере произошла ошибка при получении карточек" }));
};

const addCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  return Card.create({ name, link, owner })
    .then((card) => res.status(Create201).send({ data: card }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(Error400).send({
          message: "Переданы некорректные данные при создании карточки",
        });
      }
      return res.status(Error500).send({
        message: "На сервере произошла ошибка при добавлении карточки",
      });
    });
};

const deleteCard = (req, res) => {
  const userId = req.user._id;
  Card.findByIdAndRemove(req.params.id)

    .orFail(new Error("NotValidId"))
    .then((card) => {
      res.status(Ok200).send({ data: card });
    })
    .catch((err) => {
      if (err.message === "NotValidId") {
        res.status(Error404).send({
          message: "Передан несуществующий id карточки для её удаления",
        });
      } else if (err.name === "CastError") {
        res.status(Error400).send({
          message: "Переданы некорректные данные при удалении карточки",
        });
      } else if (Card.owner.toString() !== userId) {
        res.status(Error403).send({
          message: "Можно удалять только свои карточки",
        });
      } else {
        res.status(Error500).send({
          message: "На сервере произошла ошибка при удалении карточки",
        });
      }
    });
};

const setLike = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error("NotValidId"))
    .then((card) => {
      res.status(Ok200).send({ data: card });
    })
    .catch((err) => {
      if (err.message === "NotValidId") {
        res.status(Error404).send({
          message: "Передан несуществующий id карточки для добавления лайка",
        });
      } else if (err.name === "CastError") {
        res.status(Error400).send({
          message: "Переданы некорректные данные при добавлении лайка",
        });
      } else {
        res.status(Error500).send({
          message: "На сервере произошла ошибка при добавлении лайка",
        });
      }
    });
};

const deleteLike = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error("NotValidId"))
    .then((card) => {
      res.status(Ok200).send({ data: card });
    })
    .catch((err) => {
      if (err.message === "NotValidId") {
        res.status(Error404).send({
          message: "Передан несуществующий id карточки для снятия лайка",
        });
      } else if (err.name === "CastError") {
        res
          .status(Error400)
          .send({ message: "Переданы некорректные данные для снятия лайка" });
      } else {
        res
          .status(Error500)
          .send({ message: "На сервере произошла ошибка при снятии лайка" });
      }
    });
};

module.exports = {
  getCards,
  addCard,
  deleteCard,
  setLike,
  deleteLike,
};
