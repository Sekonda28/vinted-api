const SHA256 = require("crypto-js/sha256");
const encBase264 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const generateSaltAndHash = (password, existingSalt = "") => {
  let salt;
  if (existingSalt === "") {
    salt = uid2(16);
  } else {
    salt = existingSalt;
  }
  const hash = SHA256(password + salt).toString(encBase264);
  const token = uid2(16);
  return [token, hash, salt];
};

module.exports = generateSaltAndHash;
