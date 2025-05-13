const crypto = require("crypto");
module.exports.hashPassword = (password) =>
  crypto.createHash('sha1').update(password).digest('hex');