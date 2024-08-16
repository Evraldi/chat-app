const Joi = require('joi');

const messageSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  text: Joi.string().max(500).required(),
});

const validateInput = (req, res, next) => {
  const { error } = messageSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};

module.exports = validateInput;
