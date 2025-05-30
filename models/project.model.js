/* DT140G Guide för webbanvändbarhet. Åsa Lindskog, sali1502@student.miun.se */

"use strict";

/* Mongoose-modell för projekt */

const mongoose = require('mongoose');
const Joi = require('joi');

const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: 100
  }
}, {
  timestamps: true
});

// Joi-validering med svenska felmeddelanden
const projectValidationSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'Projektnamn måste vara en textsträng',
      'string.empty': 'Projektnamn får inte vara tomt',
      'string.min': 'Projektnamn måste vara minst 1 tecken',
      'string.max': 'Projektnamn får inte vara längre än 100 tecken',
      'any.required': 'Projektnamn är obligatoriskt'
    })
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = {
  Project,
  projectValidationSchema
};