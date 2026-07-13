const Joi = require('joi');

const messageSchema = Joi.object({
  text: Joi.string().max(500).required(),
  room: Joi.string().min(1).max(50).required(),
});

const validateInput = (req, res, next) => {
  const { error } = messageSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};

module.exports = validateInput;
