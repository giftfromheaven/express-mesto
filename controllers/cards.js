const Card = require("../models/user");

const NotFoundError = require("../errors/not-found-error");
const BadRequestError = require("../errors/bad-request-error");
const ForbiddenError = require("../errors/forbidden-error");

const Ok200 = 200;
const Ok201 = 201;

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(Ok200).send({ cards }))
    .catch(() => {
      next();
    });
};

const addCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  return Card.create({ name, link, owner })
    .then((card) => res.status(Ok201).send({ data: card }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        throw new BadRequestError("Переданы некорректные данные при создании карточки");
      }
      next(err);
    });
};

const deleteCard = (req, res, next) => {
  const userId = req.user._id;
  Card.findByIdAndRemove(req.params.id)
    .orFail(new Error("NotValidId"))
    .then((card) => {
      if (Card.owner.toString() !== userId) {
        card.remove();
        res.status(Ok200).send({ message: "Карточка удалена!" });
      } else {
        throw new ForbiddenError("У вас нет прав для удаления карточки");
      }
    })
    .catch((err) => {
      if (err.message === "NotValidId") {
        next(new NotFoundError("Передан несуществующий id карточки для её удаления"));
      } else if (err.name === "CastError") {
        next(new BadRequestError("Переданы некорректные данные при удалении карточки"));
      }
      next(err);
    });
};

const setLike = (req, res, next) => {
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
        next(new NotFoundError("Передан несуществующий id карточки для добавления лайка"));
      } else if (err.name === "CastError") {
        next(new BadRequestError("Переданы некорректные данные при добавлении лайка"));
      }
      next(err);
    });
};

const deleteLike = (req, res, next) => {
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
        next(new NotFoundError("Передан несуществующий id карточки для снятия лайка"));
      } else if (err.name === "CastError") {
        next(new BadRequestError("Переданы некорректные данные для снятия лайка"));
      }
      next(err);
    });
};

module.exports = {
  getCards,
  addCard,
  deleteCard,
  setLike,
  deleteLike,
};
