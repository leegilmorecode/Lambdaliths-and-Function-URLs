const convict = require('convict');

export const config = convict({
  tableName: {
    doc: 'The database table where we store orders',
    format: String,
    default: 'tableName',
    env: 'TABLE_NAME',
  },
  ordersServiceApiKey: {
    doc: 'The orders internal service api-key',
    format: String,
    default: '0328ec64-4426-46e6-9102-d50fce7ed7f7', // note would would pull this from a managed service
  },
}).validate({ allowed: 'strict' });
