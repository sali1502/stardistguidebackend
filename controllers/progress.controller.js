"use strict";

const Progress = require('../models/progress.model');

// Hämta all progression för alla projekt
exports.getAllProgress = async (request, h) => {
  try {
    const progress = await Progress.find({})
      .populate('projectId', 'name')
      .sort({ projectId: 1, role: 1 });

    return h.response(progress).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};

// Hämta progression för specifikt projekt
exports.getProjectProgress = async (request, h) => {
  try {
    const { projectId } = request.params;
    
    const progress = await Progress.find({ projectId })
      .populate('projectId', 'name')
      .sort({ role: 1 });

    if (!progress || progress.length === 0) {
      return h.response({ message: "Ingen progression hittades för detta projekt." }).code(404);
    }

    return h.response(progress).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};