const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AccessCore API Documentation',
            version: '1.0.0',
            description: 'API documentation for the AccessCore backend system (Authentication, Tasks, Admin).',
            contact: {
                name: 'Backend Support',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        data: { type: 'object', nullable: true, example: null },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/v1/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
