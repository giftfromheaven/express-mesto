const router = require("express").Router();

const {
  getUsers,
  getCurrentUser,
  createUser,
  updateUser,
  updateAvatar,
} = require("../controllers/users");

router.get("/users", getUsers);
router.get("/users/:id", getCurrentUser);
router.post("/users", createUser);
router.patch("/users/me", updateUser);
router.patch("/users/me/avatar", updateAvatar);

module.exports = router;
