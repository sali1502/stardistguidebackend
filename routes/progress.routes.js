/* DT140G Guide för webbtillgänglighet. Åsa Lindskog, sali1502@student.miun.se */

"use strict";

/* Routes för projektstatus (progression) */

const progressController = require("../controllers/progress.controller");

module.exports = (server) => {
  // Gemensam statussvy - (alla inloggade användare)
  server.route({
    method: "GET",
    path: "/progress",
    handler: progressController.getAllProgress,
    options: {
      auth: 'jwt'
    }
  });

  // Status för specifikt projekt (med id) - (alla inloggade användare)
  server.route({
    method: "GET",
    path: "/progress/{projectId}",
    handler: progressController.getProjectProgress,
    options: {
      auth: 'jwt'
    }
  });
};