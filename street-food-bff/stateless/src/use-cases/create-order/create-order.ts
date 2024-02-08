import { NewOrder, Order } from '@dto/orders';
import { logger, schemaValidator, signRequest } from '@shared/index';

import { HttpRequest } from '@aws-sdk/protocol-http';
import { URL } from 'url';
import { config } from '@config';
import { schema } from '@schemas/order';

export async function createOrderUseCase(newOrder: NewOrder): Promise<Order> {
  const url = new URL(`${config.get('ordersServiceUrl')}orders`);
  const apiKey = config.get('ordersServiceApiKey');

  // we create the http request to call our lambda function url
  const request = new HttpRequest({
    hostname: url.host,
    method: 'POST',
    body: JSON.stringify(newOrder),
    headers: {
      host: url.host,
      'x-api-key': apiKey,
    },
    path: url.pathname,
  });

  // we need to sign the request using sigV4 since it is IAM auth on the function url
  const signedRequest = await signRequest(request);
  const response = await fetch(url.href, signedRequest);

  if (response.status !== 201) {
    logger.error(
      `error statusCode: ${response.status}, statusText: ${response.statusText}`
    );
    throw new Error('An error has occurred');
  }
  const createdOrder = (await response.json()) as Order;

  logger.info(
    `new order returned from internal api: ${JSON.stringify(createdOrder)}`
  );

  // validate the order that has been created correctly in the downstream service
  schemaValidator(schema, createdOrder);

  logger.info(
    `order created with id ${createdOrder.id} and created date: ${createdOrder.created}`
  );

  return createdOrder;
}
