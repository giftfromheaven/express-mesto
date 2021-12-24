const Card = require("../models/user");

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ cards }))
    .catch(() => res.status(500).send({ message: "На сервере произошла ошибка при получении карточек" }));
};

const addCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  return Card.create({ name, link, owner })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(400).send({
          message: "Переданы некорректные данные при создании карточки",
        });
      }
      return res.status(500).send({
        message: "На сервере произошла ошибка при добавлении карточки",
      });
    });
};

const deleteCard = (req, res) => Card.findByIdAndRemove(req.params.id)
  .orFail(new Error("NotValidId"))
  .then((card) => {
    res.status(200).send({ data: card });
  })
  .catch((err) => {
    if (err.message === "NotValidId") {
      res.status(404).send({
        message: "Передан несуществующий id карточки для её удаления",
      });
    } else if (err.name === "CastError") {
      res.status(400).send({
        message: "Переданы некорректные данные при удалении карточки",
      });
    } else {
      res.status(500).send({
        message: "На сервере произошла ошибка при удалении карточки",
      });
    }
  });

const setLike = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error("NotValidId"))
    .then((card) => {
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.message === "NotValidId") {
        res.status(404).send({
          message: "Передан несуществующий id карточки для добавления лайка",
        });
      } else if (err.name === "CastError") {
        res.status(400).send({
          message: "Переданы некорректные данные при добавлении лайка",
        });
      } else {
        res.status(500).send({
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
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.message === "NotValidId") {
        res.status(404).send({
          message: "Передан несуществующий id карточки для снятия лайка",
        });
      } else if (err.name === "CastError") {
        res
          .status(400)
          .send({ message: "Переданы некорректные данные для снятия лайка" });
      } else {
        res
          .status(500)
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
