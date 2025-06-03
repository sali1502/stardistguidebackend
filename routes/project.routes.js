/* DT140G Guide för webbtillgänglighet. Åsa Lindskog, sali1502@student.miun.se */

"use strict";

/* Routes för projekt */

const projectController = require("../controllers/project.controller");
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

module.exports = (server) => {
  // Hämta alla projekt (alla inloggade användare)
  server.route({
    method: "GET",
    path: "/projects",
    handler: projectController.getAllProjects,
    options: {
      auth: 'jwt'
    }
  });

  // Hämta ett projekt (alla inloggade användare)
  server.route({
    method: "GET",
    path: "/projects/{id}",
    handler: projectController.getProjectById,
    options: {
      auth: 'jwt'
    }
  });

  // Skapa projekt (admin)
  server.route({
    method: "POST",
    path: "/projects",
    handler: projectController.createProject,
    options: {
      auth: 'jwt',
      pre: [adminCheck],
      validate: {
        payload: Joi.object({
          name: Joi.string().min(3).max(100).required()
            .messages({
              'string.base': 'Projektnamnet måste vara en textsträng',
              'string.empty': 'Projektnamnet får inte vara tomt',
              'string.min': 'Projektnamnet måste innehålla minst {#limit} tecken',
              'string.max': 'Projektnamnet får inte innehålla mer än {#limit} tecken',
              'any.required': 'Projektnamn är obligatoriskt'
            })
        }),
        failAction: (request, h, err) => {
          return h.response({ message: err.details[0].message }).code(400).takeover();
        }
      }
    }
  });

  // Uppdatera projekt (admin)
  server.route({
    method: "PUT",
    path: "/projects/{id}",
    handler: projectController.updateProject,
    options: {
      auth: 'jwt',
      pre: [adminCheck],
      validate: {
        payload: Joi.object({
          name: Joi.string().min(3).max(100).required()
        }),
        failAction: (request, h, err) => {
          return h.response({ message: err.details[0].message }).code(400).takeover();
        }
      }
    }
  });

  // Ta bort projekt (admin)
  server.route({
    method: "DELETE",
    path: "/projects/{id}",
    handler: projectController.deleteProject,
    options: {
      auth: 'jwt',
      pre: [adminCheck]
    }
  });
};