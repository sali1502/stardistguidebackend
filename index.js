"use strict";

const Hapi = require('@hapi/hapi');
const mongoose = require("mongoose");
require("dotenv").config();
const auth = require('./auth');

// Seedscript
const bcrypt = require('bcrypt');
const { User } = require('./models/user.model');

// Seedscript - Skapar default admin om ingen finns i databasen
const ensureAdminExists = async () => {
    try {
        const adminCount = await User.countDocuments({ role: 'admin' });
        
        if (adminCount === 0) {
            await User.create({
                username: process.env.ADMIN_USERNAME,
                password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
                role: 'admin'
            });
            
            console.log('Adminanvändare skapad från environment variables');
        }
    } catch (error) {
        console.error('Fel vid adminsetup:', error);
    }
};

const init = async () => {
    // Instans av hapi server
    const server = Hapi.server({
        port: process.env.PORT || 5000,
        host: '0.0.0.0',
        routes: {
            cors: {
               origin: [
                'http://localhost:5173',  // För lokal utveckling
                'https://accessibilityguide.netlify.app'  // Netlify URL
            ],
                credentials: true,
                maxAge: 86400,
                headers: ["Accept", "Content-Type", "Authorization", "Access-Control-Allow-Origin"],                            
            }
        }
    });

    // Anslut till MongoDB Atlas
    await mongoose.connect(process.env.DATABASE).then(() => {
        console.log("Ansluten till MongoDB!");
    }).catch((error) => {
        console.error("Fel vid anslutning till databas " + error);
        process.exit(1);
    });

    // Kör seedscript
    await ensureAdminExists();

    // Registrera JWT auth-strategi
    await auth.register(server);

    // Registrera routes
    require('./routes/user.routes')(server);
    require('./routes/project.routes')(server);
    require('./routes/post.routes')(server);
    require('./routes/checklist.routes')(server);
    require('./routes/progress.routes')(server);

    await server.start();
    console.log('Servern körs på %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
