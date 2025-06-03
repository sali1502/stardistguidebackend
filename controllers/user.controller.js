/* DT140G Guide för webbtillgänglighet. Åsa Lindskog, sali1502@student.miun.se */

"use strict";

/* Controllers för användare */

const { User, userValidationSchema } = require("../models/user.model");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Hämta alla användare (utan lösenord)
exports.getAllUsers = async (request, h) => {
  try {
    const users = await User.find({}, { password: 0 });
    return h.response(users).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};

// Hämta en användare (med id) - (utan lösenord)
exports.getUserById = async (request, h) => {
  try {
    const user = await User.findById(request.params.id, { password: 0 });
    if (!user) return h.response({ message: "Användare hittades inte." }).code(404);
    return h.response(user).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};

// Skapa användare
exports.createUser = async (request, h) => {
  try {
    const { error } = userValidationSchema.validate(request.payload);
    if (error) {
      return h.response({ message: error.details[0].message }).code(400);
    }

    const { username, password, role } = request.payload;

    // Kontrollera om användarnamn finns
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return h.response({ message: "Användarnamn finns redan." }).code(409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      role
    });

    const savedUser = await user.save();
    const { password: _, ...userData } = savedUser.toObject();

    return h.response(userData).code(201);
  } catch (error) {
    console.error("Fel vid skapande av användare:", error);
    return h.response({ message: "Internt serverfel." }).code(500);
  }
};

// Uppdatera användare
exports.updateUser = async (request, h) => {
  try {
    const updates = { ...request.payload };

    // Uppdatera användare - kontrollera att användarnamn är unikt
    if (updates.username) {
      const existingUser = await User.findOne({ username: updates.username });
      if (existingUser && existingUser._id.toString() !== request.params.id) {
        return h.response({ message: "Användarnamn finns redan." }).code(409);
      }
    }

    // Uppdatera användare - hasha lösenord
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(request.params.id, updates, { new: true, runValidators: true });

    if (!updatedUser) return h.response({ message: "Användare hittades inte." }).code(404);

    const { password: _, ...userData } = updatedUser.toObject();

    return h.response(userData).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};

// Radera användare
exports.deleteUser = async (request, h) => {
  try {
    const result = await User.findByIdAndDelete(request.params.id);
    if (!result) return h.response({ message: "Användare hittades inte." }).code(404);
    return h.response().code(204);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};

// Logga in användare
exports.loginUser = async (request, h) => {
  const { username, password } = request.payload;
  try {
    // Hämta användare med lösenord
    const user = await User.findOne({ username });
    if (!user) {
      return h.response({ message: "Användarnamn eller lösenord är fel." }).code(401);
    }

    const correctPassword = await user.comparePassword(password);
    if (!correctPassword) {
      return h.response({ message: "Användarnamn eller lösenord är fel." }).code(401);
    }

    // Generera JWT
    const token = request.server.methods.generateToken({
      id: user._id.toString(),
      username: user.username,
      role: user.role
    });

    return h
      .response({
        message: "Du är inloggad!",
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          role: user.role
        }
      })
      .code(200);
  } catch (error) {
    console.error(error);
    return h.response({ message: "Internt serverfel." }).code(500);
  }
};