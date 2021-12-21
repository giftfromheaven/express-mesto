const router = require("express").Router();

const {
  getCards, addCard, deleteCard, setLike, deleteLike,
} = require("../controllers/cards");

router.get("/cards", getCards);
router.post("/cards", addCard);
router.delete("/cards/:id", deleteCard);
router.put("/cards/:id/likes", setLike);
router.delete("/cards/:id/likes", deleteLike);

module.exports = router;
