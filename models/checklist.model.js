/* DT140G Guide för webbanvändbarhet. Åsa Lindskog, sali1502@student.miun.se */

"use strict";

/* Mongoose-modell för checklista */

const mongoose = require('mongoose');
const Joi = require('joi');

const Schema = mongoose.Schema;

const ChecklistItemSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
});

const ChecklistSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  role: {
    type: String,
    enum: ['designer', 'developer', 'tester'],
    required: true
  },
  items: [ChecklistItemSchema]
}, {
  timestamps: true
});

// Compound index för att snabbt hitta checklista baserat på projekt och roll
ChecklistSchema.index({ projectId: 1, role: 1 }, { unique: true });

// Joi-validering med svenska felmeddelanden
const checklistValidationSchema = Joi.object({
  projectId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.base': 'Projekt-ID måste vara en textsträng',
      'string.empty': 'Projekt-ID får inte vara tomt',
      'string.pattern.base': 'Projekt-ID måste vara ett giltigt MongoDB ObjectId (24 tecken hexadecimalt)',
      'any.required': 'Projekt-ID är obligatoriskt'
    }),
  role: Joi.string()
    .valid('designer', 'developer', 'tester')
    .required()
    .messages({
      'string.base': 'Roll måste vara en textsträng',
      'any.only': 'Roll måste vara antingen "designer", "developer" eller "tester"',
      'any.required': 'Roll är obligatorisk'
    }),
  items: Joi.array()
    .items(
      Joi.object({
        title: Joi.string()
          .required()
          .messages({
            'string.base': 'Titel måste vara en textsträng',
            'string.empty': 'Titel får inte vara tom',
            'any.required': 'Titel är obligatorisk'
          }),
        content: Joi.string()
          .required()
          .messages({
            'string.base': 'Innehåll måste vara en textsträng',
            'string.empty': 'Innehåll får inte vara tomt',
            'any.required': 'Innehåll är obligatoriskt'
          }),
        completed: Joi.boolean()
          .messages({
            'boolean.base': 'Slutförd-status måste vara sant eller falskt'
          })
      })
    )
    .messages({
      'array.base': 'Punktlistan måste vara en array'
    })
});

const checklistItemUpdateSchema = Joi.object({
  completed: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'Slutförd-status måste vara sant eller falskt',
      'any.required': 'Slutförd-status är obligatorisk'
    }),
  itemId: Joi.string()
    .required()
    .messages({
      'string.base': 'Punkt-Id måste vara en textsträng',
      'string.empty': 'Punkt-Id får inte vara tomt',
      'any.required': 'Punkt-Id är obligatoriskt'
    })
});

const Checklist = mongoose.model('Checklist', ChecklistSchema);

// Exportera schema med validering
module.exports = {
  Checklist,
  checklistValidationSchema,
  checklistItemUpdateSchema
};