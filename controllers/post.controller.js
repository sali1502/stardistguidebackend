/* DT140G Guide för webbtillgänglighet. Åsa Lindskog, sali1502@student.miun.se */

"use strict";

/* Controllers för inlägg */

const { Post } = require("../models/post.model");
const Boom = require("@hapi/boom");

// Hämta alla inlägg – (admin eller användarroll)
exports.getAllPosts = async (request, h) => {
    try {
        const userRole = request.auth.credentials.role;

        const filter = (userRole === 'admin')
            ? {}
            : { role: { $in: [userRole, 'all'] } };

        const posts = await Post.find(filter).sort({ createdAt: -1 });
        return h.response(posts).code(200);
    } catch (error) {
        return Boom.internal('Kunde inte hämta inlägg');
    }
};

// Hämta ett inlägg (med id) – (admin eller användarroll)
exports.getPostById = async (request, h) => {
    try {
        const { id } = request.params;
        const userRole = request.auth.credentials.role;

        const post = await Post.findById(id);
        if (!post) {
            return Boom.notFound('Inlägget hittades inte');
        }

        if (userRole !== 'admin' && !['all', userRole].includes(post.role)) {
            return Boom.forbidden('Du har inte behörighet att visa detta inlägg');
        }

        return h.response(post).code(200);
    } catch (error) {
        return Boom.internal('Fel vid hämtning av inlägg');
    }
};

// Skapa inlägg (admin)
exports.createPost = async (request, h) => {
    try {
        const newPost = new Post(request.payload);
        const savedPost = await newPost.save();
        return h.response(savedPost).code(201);
    } catch (error) {
        return Boom.internal('Kunde inte skapa inlägg');
    }
};

// Uppdatera inlägg (admin)
exports.updatePost = async (request, h) => {
    try {
        const { id } = request.params;
        const updatedPost = await Post.findByIdAndUpdate(id, request.payload, { new: true });

        if (!updatedPost) {
            return Boom.notFound('Inlägget kunde inte hittas');
        }

        return h.response(updatedPost).code(200);
    } catch (error) {
        return Boom.internal('Kunde inte uppdatera inlägg');
    }
};

// Radera inlägg (admin)
exports.deletePost = async (request, h) => {
    try {
        const { id } = request.params;
        const deletedPost = await Post.findByIdAndDelete(id);

        if (!deletedPost) {
            return Boom.notFound('Inlägget kunde inte hittas');
        }

        return h.response({ message: 'Inlägg raderat' }).code(200);
    } catch (error) {
        return Boom.internal('Kunde inte radera inlägg');
    }
};