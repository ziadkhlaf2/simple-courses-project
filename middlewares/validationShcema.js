const { body } = require("express-validator");

const validationShcema = (req, res, next) => {
  return [
    body("name")
      .notEmpty()
      .withMessage("name is required")
      .isString()
      .isLength({ min: 3 }),
  ];
};

module.exports = {validationShcema};
