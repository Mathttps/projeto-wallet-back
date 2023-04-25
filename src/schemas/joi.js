import joi from "joi";

const signUpSchema = joi.object({
  name: joi.string().required().min(2).max(20),
  email: joi.string().email().required(),
  password: joi.string().required().min(6),
  confirmPassword: joi.ref("password")
});
