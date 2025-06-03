/* DT140G Guide för webbtillgänglighet. Åsa Lindskog, sali1502@student.miun.se */

"use strict";

/* Controllers för checklistor */

const { Checklist, checklistValidationSchema, checklistItemUpdateSchema } = require('../models/checklist.model');
const Progress = require('../models/progress.model');

// Hämta checklist för specifikt projekt och roll
exports.getChecklist = async (request, h) => {
  try {
    const { projectId, role } = request.params;
    
    const checklist = await Checklist.findOne({ projectId, role })
      .populate('projectId', 'name');

    if (!checklist) {
      return h.response({ message: "Checklista hittades inte." }).code(404);
    }

    return h.response(checklist).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};

// Hämta alla checklistor för ett projekt (admin)
exports.getProjectChecklists = async (request, h) => {
  try {
    const { projectId } = request.params;
    
    const checklists = await Checklist.find({ projectId })
      .populate('projectId', 'name')
      .sort({ role: 1 });

    return h.response(checklists).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};

// Lägg till ny checklistpunkt (admin)
exports.addChecklistItem = async (request, h) => {
  try {
    const { projectId, role } = request.params;
    const { title, content } = request.payload;

    const checklist = await Checklist.findOne({ projectId, role });
    if (!checklist) {
      return h.response({ message: "Checklista hittades inte." }).code(404);
    }

    checklist.items.push({ title, content });
    await checklist.save();

    // Uppdatera det totala antalet checklistpunkter för progressionsbar
    await Progress.findOneAndUpdate(
      { projectId, role },
      { $inc: { totalItems: 1 } }
    );

    return h.response(checklist).code(201);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};

// Radera en checklistpunkt (admin)
exports.removeChecklistItem = async (request, h) => {
  try {
    const { projectId, role, itemId } = request.params;

    const checklist = await Checklist.findOne({ projectId, role });
    if (!checklist) {
      return h.response({ message: "Checklista hittades inte." }).code(404);
    }

    const itemIndex = checklist.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return h.response({ message: "Checklistpunkt hittades inte." }).code(404);
    }

    const wasCompleted = checklist.items[itemIndex].completed;
    checklist.items.splice(itemIndex, 1);
    await checklist.save();

    // Uppdatera progressionsbar
    const updateObj = { $inc: { totalItems: -1 } };
    if (wasCompleted) {
      updateObj.$inc.completedItems = -1;
    }

    await Progress.findOneAndUpdate({ projectId, role }, updateObj);

    return h.response(checklist).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};

// Uppdatera checklista (admin)
exports.updateChecklistItem = async (request, h) => {
  try {
    const { projectId, role, itemId } = request.params;
    const { title, content } = request.payload;

    const checklist = await Checklist.findOne({ projectId, role });
    if (!checklist) {
      return h.response({ message: "Checklista hittades inte." }).code(404);
    }

    const item = checklist.items.id(itemId);
    if (!item) {
      return h.response({ message: "Checklistpunkt hittades inte." }).code(404);
    }

    if (title !== undefined) item.title = title;
    if (content !== undefined) item.content = content;

    await checklist.save();
    return h.response(checklist).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};

// Markera checklistpunkt som klar/ej klar (rollbaserad användare)
exports.toggleChecklistItem = async (request, h) => {
  try {
    const { error } = checklistItemUpdateSchema.validate(request.payload);
    if (error) {
      return h.response({ message: error.details[0].message }).code(400);
    }

    const { projectId, role } = request.params;
    const { itemId, completed } = request.payload;

    const checklist = await Checklist.findOne({ projectId, role });
    if (!checklist) {
      return h.response({ message: "Checklista hittades inte." }).code(404);
    }

    const item = checklist.items.id(itemId);
    if (!item) {
      return h.response({ message: "Checklistpunkt hittades inte." }).code(404);
    }

    const wasCompleted = item.completed;
    item.completed = completed;
    await checklist.save();

    // Uppdatera progressionsbar
    if (completed && !wasCompleted) {
      await Progress.findOneAndUpdate(
        { projectId, role },
        { $inc: { completedItems: 1 }, lastUpdated: new Date() }
      );
    } else if (!completed && wasCompleted) {
      await Progress.findOneAndUpdate(
        { projectId, role },
        { $inc: { completedItems: -1 }, lastUpdated: new Date() }
      );
    }

    return h.response(checklist).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};