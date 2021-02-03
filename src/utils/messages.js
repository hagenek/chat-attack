const { text } = require("express");

const createMessage = (text) => ({
  text: text,
  createdAt: new Date().getTime(),
});

module.exports = {
  createMessage,
};
