const convict = require('convict');

export const config = convict({
  ordersServiceUrl: {
    doc: 'The orders internal service url',
    format: String,
    default: 'ORDERS_URL',
    env: 'ORDERS_URL',
  },
  ordersServiceApiKey: {
    doc: 'The orders internal service api-key',
    format: String,
    default: '0328ec64-4426-46e6-9102-d50fce7ed7f7', // note would would pull this from a managed service
  },
}).validate({ allowed: 'strict' });
