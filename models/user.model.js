"use strict";

/* Mongoose-modell för användare */

const mongoose = require('mongoose');
const Joi = require('joi');
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['designer', 'developer', 'tester', 'admin'],
    required: true
  }
}, {
  timestamps: true
});

// Jämför lösenord
UserSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

// Joi-validering med svenska felmeddelanden
const userValidationSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.base': 'Användarnamn måste vara en text',
      'string.empty': 'Användarnamn får inte vara tomt',
      'string.min': 'Användarnamn måste innehålla minst {#limit} tecken',
      'string.max': 'Användarnamn får inte innehålla mer än {#limit} tecken',
      'any.required': 'Användarnamn krävs'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.base': 'Lösenord måste vara en text',
      'string.empty': 'Lösenord får inte vara tomt',
      'string.min': 'Lösenord måste innehålla minst {#limit} tecken',
      'any.required': 'Lösenord krävs'
    }),
  role: Joi.string()
    .valid('designer', 'developer', 'tester', 'admin')
    .required()
    .messages({
      'string.base': 'Roll måste vara en text',
      'string.empty': 'Roll får inte vara tom',
      'any.only': 'Roll måste vara antingen "designer", "developer", "tester" eller "admin"',
      'any.required': 'Roll krävs'
    })
});

const User = mongoose.model('User', UserSchema);

// Exportera schema med validering
module.exports = {
  User,
  userValidationSchema
};