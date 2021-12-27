// models/user.js

const { Schema, model } = require("mongoose");
const { isEmail, isURL } = require("validator");
const bcrypt = require("bcrypt");
// Опишем схему:
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator: (url) => isURL(url),
      message: "Ссылка не подходит",
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => isEmail(email),
      messages: "Не подходящий адрес электронной почты",
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function compare(email, password) {
  return this.findOne({ email }).select("+password")
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("Неправильные почта или пароль"));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error("Неправильные почта или пароль"));
          }

          return user;
        });
    });
};

module.exports = model("user", userSchema);
