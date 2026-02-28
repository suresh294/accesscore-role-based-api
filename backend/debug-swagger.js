const swaggerSpecs = require('./src/config/swagger');
console.log('Swagger Specs Generated:');
console.log(JSON.stringify(swaggerSpecs, null, 2));

if (!swaggerSpecs.paths || Object.keys(swaggerSpecs.paths).length === 0) {
    console.log('\nWARNING: No paths found! Check your "apis" glob pattern in swagger.js');
} else {
    console.log(`\nFound ${Object.keys(swaggerSpecs.paths).length} paths.`);
}
