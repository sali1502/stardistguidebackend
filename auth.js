"use strict";

const Jwt = require("@hapi/jwt");
require("dotenv").config();

module.exports = {
  register: async (server) => {
    // Registrera JWT plugin
    await server.register([Jwt]);

    // Skapa JWT auth-strategi
    server.auth.strategy("jwt", "jwt", {
      keys: process.env.JWT_SECRET_KEY,
      verify: {
        aud: false,
        iss: false,
        sub: false,
        maxAgeSec: 24 * 60 * 60, // 24 timmar
        timeSkewSec: 15
      },
      validate: async (artifacts, request, h) => {
        try {
          if (!artifacts.decoded.payload.user) {
            return { isValid: false };
          }
          const credentials = artifacts.decoded.payload.user;
          return { isValid: true, credentials };
        } catch (err) {
          console.error("Token-validering misslyckades:", err.message);
          return { isValid: false };
        }
      }
    });

    // Använd som standard
    server.auth.default("jwt");

    // Utility-funktion för att extrahera token från Authorization header
    server.ext('onPreAuth', (request, h) => {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        request.auth.token = authHeader.substring(7);
      }
      return h.continue;
    });

    // Generera token
    server.method('generateToken', (user) => {
      return Jwt.token.generate(
        { user },
        { key: process.env.JWT_SECRET_KEY, algorithm: "HS256" },
        { ttlSec: 24 * 60 * 60 } // 24 timmar
      );
    });
  }
};