const createResourceRouter = require('./resourceRouter');
const schemas = require('../utils/resourceSchemas');

module.exports = createResourceRouter(schemas.hospitals);
