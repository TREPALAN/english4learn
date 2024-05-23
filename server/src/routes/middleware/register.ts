import { body, validationResult } from "express-validator";
import User from "../../../models/user";

const register = [
  body("username")
    .notEmpty()
    .isString()
    .withMessage("username is required")
    .custom((value) => {
      const dangerousChars = /[\`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi;
      if (dangerousChars.test(value)) {
        throw new Error("username cannot contain especial characters");
      }

      return true;
    }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
  body("email")
    .notEmpty()
    .escape()
    .isEmail()
    .withMessage("email is required")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email already in use");
      }
    }),

  (req: any, res: any, next: any) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      return next();
    }
    return res.status(400).json({
      message: result.array()[0].msg,
    });
  },
];

export default register;
