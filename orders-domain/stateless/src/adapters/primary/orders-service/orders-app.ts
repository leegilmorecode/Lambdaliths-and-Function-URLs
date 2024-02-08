import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { logger, serviceErrorHandler } from '@shared/index';

import { ForbiddenError } from '@errors/forbidden-error';
import { NewOrder } from '@dto/orders';
import { config } from '@config';
import { createOrderUseCase } from '@use-cases/create-order/create-order';
import { getOrderUseCase } from '@use-cases/get-order/get-order';

export const app = fastify({ logger: true });

// add a validation hook for all requests
app.addHook(
  'onRequest',
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // As a basic example only, we add some api key validation here
      // note: we can use the @fastify/auth module for production apps
      // https://github.com/fastify/fastify-auth
      if (request.headers['x-api-key'] !== config.get('ordersServiceApiKey')) {
        logger.error('wrong api key');
        throw new ForbiddenError('Forbidden');
      }
    } catch (error) {
      return serviceErrorHandler(error, reply);
    }
  }
);

// create order endpoint for our fastify app
app.post('/orders', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const orderPayload = JSON.parse(request.body as string) as NewOrder;
    const createdOrder = await createOrderUseCase(orderPayload);

    return reply.status(201).send(createdOrder);
  } catch (error) {
    return serviceErrorHandler(error, reply);
  }
});

// get order by id endpoint for our fastify app
app.get('/orders/:id', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const order = await getOrderUseCase(id);

    return reply.status(200).send(order);
  } catch (error) {
    return serviceErrorHandler(error, reply);
  }
});
