const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const {
  getUsers,
  getCurrentUser,
  updateUser,
  updateAvatar,
  getUserMe,
} = require("../controllers/users");

router.get("/users", getUsers);
router.get("/users/me", getUserMe);
router.get("/users/:id", celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
}), getCurrentUser);
router.patch("/users/me", celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(30).required(),
  }),
}), updateUser);
router.patch("/users/me/avatar", celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(/^https?:\/\/(www.)?[a-zA-Z0-9-.]+\.[a-zA-Z]{2,}([a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+)*#*$/),
  }),
}), updateAvatar);

module.exports = router;
