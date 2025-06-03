/* DT140G Guide för webbtillgänglighet. Åsa Lindskog, sali1502@student.miun.se */

"use strict";

/* Routes för inlägg */

const postController = require("../controllers/post.controller");
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

  // Joi-validering
  const postValidationSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    content: Joi.string().required(),
    role: Joi.string().valid('designer', 'developer', 'tester', 'all').required(),
  });

  module.exports = (server) => {

    // Hämta inlägg (alla inloggade användare)
    server.route({
      method: "GET",
      path: "/posts",
      handler: postController.getAllPosts,
      options: {
        auth: 'jwt'
      }
    });

    server.route({
      method: "GET",
      path: "/posts/{id}",
      handler: postController.getPostById,
      options: {
        auth: 'jwt'
      }
    });

    // Skapa inlägg (admin)
    server.route({
      method: "POST",
      path: "/posts",
      handler: postController.createPost,
      options: {
        auth: 'jwt',
        pre: [adminCheck],
        validate: {
          payload: postValidationSchema,
          failAction: (request, h, err) => {
            return h.response({ message: err.details[0].message }).code(400).takeover();
          }
        }
      }
    });

    // Uppdatera inlägg (admin)
    server.route({
      method: "PUT",
      path: "/posts/{id}",
      handler: postController.updatePost,
      options: {
        auth: 'jwt',
        pre: [adminCheck],
        validate: {
          payload: postValidationSchema,
          failAction: (request, h, err) => {
            return h.response({ message: err.details[0].message }).code(400).takeover();
          }
        }
      }
    });

    // Radera inlägg (admin)
    server.route({
      method: "DELETE",
      path: "/posts/{id}",
      handler: postController.deletePost,
      options: {
        auth: 'jwt',
        pre: [adminCheck]
      }
    });

  };