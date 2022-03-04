const bcrypt = require("bcrypt");

function validateUser(user) {
  let valid = true;
  valid = valid && user.username;
  valid = valid && user.username.length > 0;
  valid = valid && user.hashedPassword;
  valid = valid && user.hashedPassword.length > 0;
  return valid;
}

function validateUsername(username) {
  let valid = true;
  valid = valid && username.username;
  valid = valid && username.username.length > 0;
  return valid;
}

function validatePost(post) {
  let valid = true;
  valid = valid && post.content;
  valid = valid && post.content.length > 0;
  return valid;
}

const hashPassword = (password) => {
  const hashValue = bcrypt.hashSync(password, 8);
  return hashValue;
};

const comparePassword = (password, hash) => {
  const correct = bcrypt.compareSync(password, hash);
  return correct;
};

module.exports = {
  hashPassword,
  comparePassword,
  validateUser,
  validateUsername,
  validatePost,
};
