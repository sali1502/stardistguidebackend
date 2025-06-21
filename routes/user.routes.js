"use strict";

/* Routes för användare */

const userController = require("../controllers/user.controller");
const Joi = require("joi");
const { userValidationSchema } = require("../models/user.model");
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

// Tillåt bara admin eller den egna rollen
const userOrAdminCheck = {
  method: async (request, h) => {
    const { id } = request.params;
    const { role, id: userId } = request.auth.credentials;
    if (role !== 'admin' && id !== userId) {
      throw Boom.forbidden('Åtkomst nekad. Du kan bara hantera din egen användare.');
    }
    return h.continue;
  }
};

module.exports = (server) => {

  // Hämta alla användare (admin)
  server.route({
    method: "GET",
    path: "/users",
    handler: userController.getAllUsers,
    options: {
      auth: 'jwt',
      pre: [adminCheck]
    }
  });

  // Hämta en användare (med id) (admin eller den egna rollen)
  server.route({
    method: "GET",
    path: "/users/{id}",
    handler: userController.getUserById,
    options: {
      auth: 'jwt',
      pre: [userOrAdminCheck]
    }
  });

  // Logga in (öppen)
  server.route({
    method: "POST",
    path: "/users/login",
    handler: userController.loginUser,
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          username: Joi.string().min(1).required()
            .messages({
              'string.base': 'Användarnamn måste vara en textsträng',
              'string.empty': 'Användarnamn får inte vara tomt',
              'any.required': 'Användarnamn är obligatoriskt'
            }),
          password: Joi.string().min(1).required()
            .messages({
              'string.base': 'Lösenord måste vara en textsträng',
              'string.empty': 'Lösenord får inte vara tomt',
              'any.required': 'Lösenord är obligatoriskt'
            })
        }),
        failAction: (request, h, err) => {
          return h.response({ message: err.details[0].message }).code(400).takeover();
        }
      }
    }
  });

  // Skapa användare (admin)
  server.route({
    method: "POST",
    path: "/users",
    handler: userController.createUser,
    options: {
      auth: 'jwt',
      pre: [adminCheck],
      validate: {
        payload: userValidationSchema,
        failAction: (request, h, err) => {
          return h.response({ message: err.details[0].message }).code(400).takeover();
        }
      }
    }
  });

  // Uppdatera användare (admin)
  server.route({
    method: "PUT",
    path: "/users/{id}",
    handler: userController.updateUser,
    options: {
      auth: 'jwt',
      pre: [adminCheck],
      validate: {
        payload: Joi.object({
          username: Joi.string().min(3),
          role: Joi.string().valid('admin', 'designer', 'developer', 'tester'),
          password: Joi.string().min(6)
        }).min(1).messages({
          'object.min': 'Minst ett fält måste uppdateras'
        }),
        failAction: (request, h, err) => {
          return h.response({ message: err.details[0].message }).code(400).takeover();
        }
      }
    }
  });

  // Radera användare (admin)
  server.route({
    method: "DELETE",
    path: "/users/{id}",
    handler: userController.deleteUser,
    options: {
      auth: 'jwt',
      pre: [adminCheck]
    }
  });
};