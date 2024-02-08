export const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    order: {
      type: 'object',
      properties: {
        customer: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            address: { type: 'string' },
          },
          required: ['name', 'email', 'phone', 'address'],
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              quantity: { type: 'number' },
              price: { type: 'number' },
            },
            required: ['name', 'quantity', 'price'],
          },
        },
        deliveryMethod: {
          type: 'string',
          enum: ['pickup', 'delivery'],
        },
        paymentMethod: {
          type: 'string',
          enum: ['credit_card', 'cash', 'paypal'],
        },
        totalAmount: { type: 'number' },
      },
      required: [
        'customer',
        'items',
        'deliveryMethod',
        'paymentMethod',
        'totalAmount',
      ],
    },
  },
  required: ['order'],
};
