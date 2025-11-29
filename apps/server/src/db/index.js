const publicSchema = require('./publicSchema');
const tenantSchema = require('./tenantSchema');

module.exports = {
    ...publicSchema,
    ...tenantSchema
};
