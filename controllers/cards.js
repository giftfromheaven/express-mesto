const Card = require("../models/card");

const NotFoundError = require("../errors/not-found-error");
const BadRequestError = require("../errors/bad-request-error");
const ForbiddenError = require("../errors/forbidden-error");

const { Ok200, Ok201 } = require("../utils/const");

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
        next(new BadRequestError("Переданы некорректные данные при создании карточки"));
      }
      next(err);
    });
};

const deleteCard = (req, res, next) => {
  const userId = req.user._id;
  Card.findById(req.params.id)
    .orFail(() => new NotFoundError("Передан несуществующий id карточки для её удаления"))
    .then((card) => {
      if (card.owner.toString() === userId) {
        return card.remove()
          .then(res.status(Ok200).send({ message: "Карточка удалена!" }));
      }
      return next(new ForbiddenError("У вас нет прав для удаления карточки"));
    })
    .catch((err) => {
      if (err.name === "CastError") {
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
    .orFail(() => new NotFoundError("Передан несуществующий id карточки для добавления лайка"))
    .then((card) => {
      res.status(Ok200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === "CastError") {
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
    .orFail(() => new NotFoundError("Передан несуществующий id карточки для снятия лайка"))
    .then((card) => {
      res.status(Ok200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === "CastError") {
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
