"use strict";

/* Routes för checklistor */

const checklistController = require("../controllers/checklist.controller");
const Joi = require("joi");
const Boom = require("@hapi/boom");

// Kontrollera admin-behörighet
const adminCheck = {
  method: async (request, h) => {
    const { role } = request.auth.credentials;
    if (role !== 'admin') {
      throw Boom.forbidden('Endast administratörer kan utföra denna åtgärd');
    }
    return h.continue;
  }
};

// Kontrollera rollåtkomst
const roleAccessCheck = {
  method: async (request, h) => {
    const { role: paramRole } = request.params;
    const { role: userRole } = request.auth.credentials;
    
    // Admin har åtkomst till allt
    if (userRole === 'admin') {
      return h.continue;
    }
    
    // Användare kan bara komma åt sin egen roll
    if (userRole !== paramRole) {
      throw Boom.forbidden('Du har inte behörighet att komma åt denna roll');
    }
    
    return h.continue;
  }
};

module.exports = (server) => {
  // Hämta checklista för specifikt projekt och roll
  server.route({
    method: "GET",
    path: "/checklists/{projectId}/{role}",
    handler: checklistController.getChecklist,
    options: {
      auth: 'jwt',
      pre: [roleAccessCheck]
    }
  });

  // Hämta alla checklistor för ett projekt (admin)
  server.route({
    method: "GET",
    path: "/checklists/{projectId}",
    handler: checklistController.getProjectChecklists,
    options: {
      auth: 'jwt',
      pre: [adminCheck]
    }
  });

  // Lägg till checklistpunkt (admin)
  server.route({
    method: "POST",
    path: "/checklists/{projectId}/{role}/items",
    handler: checklistController.addChecklistItem,
    options: {
      auth: 'jwt',
      pre: [adminCheck],
      validate: {
        payload: Joi.object({
          title: Joi.string().required(),
          content: Joi.string().required()
        }),
        failAction: (request, h, err) => {
          return h.response({ message: err.details[0].message }).code(400).takeover();
        }
      }
    }
  });

  // Uppdatera checklistpunkt (admin)
  server.route({
    method: "PUT",
    path: "/checklists/{projectId}/{role}/items/{itemId}",
    handler: checklistController.updateChecklistItem,
    options: {
      auth: 'jwt',
      pre: [adminCheck],
      validate: {
        payload: Joi.object({
          title: Joi.string().optional(),
          content: Joi.string().optional()
        }).min(1),
        failAction: (request, h, err) => {
          return h.response({ message: err.details[0].message }).code(400).takeover();
        }
      }
    }
  });

  // Radera checklistpunkt (admin)
  server.route({
    method: "DELETE",
    path: "/checklists/{projectId}/{role}/items/{itemId}",
    handler: checklistController.removeChecklistItem,
    options: {
      auth: 'jwt',
      pre: [adminCheck]
    }
  });

  // Markera checklistpunkt (rollbaserad användare)
  server.route({
    method: "PATCH",
    path: "/checklists/{projectId}/{role}/toggle",
    handler: checklistController.toggleChecklistItem,
    options: {
      auth: 'jwt',
      pre: [roleAccessCheck],
      validate: {
        payload: Joi.object({
          itemId: Joi.string().required(),
          completed: Joi.boolean().required()
        }),
        failAction: (request, h, err) => {
          return h.response({ message: err.details[0].message }).code(400).takeover();
        }
      }
    }
  });
};