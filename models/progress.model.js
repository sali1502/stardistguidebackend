/* DT140G Guide för webbanvändbarhet. Åsa Lindskog, sali1502@student.miun.se */

"use strict";

/* Mongoose-schema för projektstatus (progression) */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProgressSchema = new Schema({
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
  completedItems: {
    type: Number,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Compound index för att snabbt hitta progression baserat på projekt och roll
ProgressSchema.index({ projectId: 1, role: 1 }, { unique: true });

const Progress = mongoose.model('Progress', ProgressSchema);

// Exportera schema
module.exports = Progress;