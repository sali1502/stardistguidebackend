/* DT140G Guide för webbtillgänglighet. Åsa Lindskog, sali1502@student.miun.se */

"use strict";

const Hapi = require('@hapi/hapi');
const mongoose = require("mongoose");
require("dotenv").config();
const auth = require('./auth');

const init = async () => {

    // Instans av hapi server
    const server = Hapi.server({
        port: 5000,
        host: 'localhost',
        routes: {
            cors: {
                origin: ['http://localhost:5173', 'https://www.thunderclient.com', 'http://127.0.0.1:5000'], // Tillåtna domäner
                credentials: true, // Skicka token i headers
                maxAge: 86400,
                headers: ["Accept", "Content-Type", "Authorization", "Access-Control-Allow-Origin"],
                
            }
        }
    });

    // Anslut till MongoDB Atlas
    mongoose.connect(process.env.DATABASE).then(() => {
        console.log("Ansluten till MongoDB!");
    }).catch((error) => {
        console.error("Fel vid anslutning till databas " + error);
    });

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
