const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");

const {
  getCards, addCard, deleteCard, setLike, deleteLike,
} = require("../controllers/cards");

router.get("/cards", getCards);
router.post("/cards", celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(/^https?:\/\/(www.)?[a-zA-Z0-9-.]+\.[a-zA-Z]{2,}([a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+)*#*$/),
  }),
}), addCard);
router.delete("/cards/:id", celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
}), deleteCard);
router.put("/cards/:id/likes", celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
}), setLike);
router.delete("/cards/:id/likes", celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
}), deleteLike);

module.exports = router;
