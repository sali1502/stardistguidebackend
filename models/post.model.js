"use strict";

/* Mongoose-modell för inlägg */

const mongoose = require('mongoose');
const Joi = require('joi');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['designer', 'developer', 'tester'],
    required: true
  },
}, {
  timestamps: true
});

// Joi-validering med svenska felmeddelanden
const postValidationSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'Titeln måste vara en textsträng',
      'string.empty': 'Titeln får inte vara tom',
      'string.min': 'Titeln måste innehålla minst {#limit} tecken',
      'string.max': 'Titeln får inte innehålla mer än {#limit} tecken',
      'any.required': 'Titeln är obligatorisk'
    }),
  content: Joi.string()
    .required()
    .messages({
      'string.base': 'Innehållet måste vara en textsträng',
      'string.empty': 'Innehållet får inte vara tomt',
      'any.required': 'Innehåll är obligatoriskt'
    }),
  role: Joi.string()
    .valid('designer', 'developer', 'tester')
    .required()
    .messages({
      'string.base': 'Roll måste vara en textsträng',
      'any.only': 'Roll måste vara antingen "designer", "developer" eller "tester"',
      'any.required': 'Roll är obligatorisk'
    })
});

const Post = mongoose.model('Post', PostSchema);

// Exportera schema med validering
module.exports = {
  Post,
  postValidationSchema
};