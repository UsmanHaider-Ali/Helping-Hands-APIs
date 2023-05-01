const Web3 = require("web3");

module.exports = new Web3(
  new Web3.providers.HttpProvider(`HTTP://127.0.0.1:7545`)
);
