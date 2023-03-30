const swaggereJsdoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition:{
        openapi: "3.0.0",
        info:{
            title: "Test API",
            version: "1.0.0",
            description: 'sample API',
        },
        servers: [
            {
                url: 'http://localhost:3001'
            }
        ],
        securityDefinitions: {
            CookieAuth:{
            type: 'apiKey',
            name: 'access_token',
            in: 'cookie',
            description: 'JWT access token',
            },
        },
    },
    apis:['./router/*.js'],
    
};

const specs = swaggereJsdoc(options);

module.exports = specs;