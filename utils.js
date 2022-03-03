const bcrypt = require("bcrypt");

const hashPassword = (password) => {
  const hashValue = bcrypt.hashSync(password, 8);
  return hashValue;
};

const comparePassword = (password, hash) => {
  const correct = bcrypt.compareSync(password, hash);
  return correct;
};

// function getId(id, next) {
//   let parsedid = undefined;

//   try {
//     parsedid = ObjectId(id);
//   } catch {
//     next();
//   }

//   return parsedid;
// }

// const getId = (id, next) => {
//   let parsedid = undefined;

//   try {
//     parsedid = ObjectId(id);
//   } catch {
//     next();
//   }

//   return parsedid;
// };

module.exports = {
  hashPassword,
  comparePassword,
  //  getId,
};
