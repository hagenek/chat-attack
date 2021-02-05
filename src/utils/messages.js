const { text } = require("express");

const createMessage = (username, text) => ({
  username,
  text,
  createdAt: new Date().getTime(),
});

module.exports = {
  createMessage,
};
