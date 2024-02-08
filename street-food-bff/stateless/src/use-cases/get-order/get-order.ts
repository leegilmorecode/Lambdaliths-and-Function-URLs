import { logger, schemaValidator, signRequest } from '@shared/index';

import { HttpRequest } from '@aws-sdk/protocol-http';
import { Order } from '@dto/orders';
import { URL } from 'url';
import { config } from '@config';
import { schema } from '@schemas/order';

export async function getOrderUseCase(orderId: string): Promise<Order> {
  const url = new URL(`${config.get('ordersServiceUrl')}orders/${orderId}`);
  const apiKey = config.get('ordersServiceApiKey');

  // we create the http request to call our lambda function url
  const request = new HttpRequest({
    hostname: url.host,
    method: 'GET',
    headers: {
      host: url.host,
      'x-api-key': apiKey,
    },
    path: url.pathname,
  });

  // we need to sign the request using sigV4 since it is IAM auth on the function url
  const signedRequest = await signRequest(request);
  const response = await fetch(url.href, signedRequest);

  if (response.status !== 200) {
    logger.error(
      `error statusCode: ${response.status}, statusText: ${response.statusText}`
    );
    throw new Error('An error has occurred');
  }
  const retrievedOrder = (await response.json()) as Order;

  logger.info(
    `order returned from internal api: ${JSON.stringify(retrievedOrder)}`
  );

  // validate the order that has been recieved correctly from the downstream service
  schemaValidator(schema, retrievedOrder);

  logger.info(`order retrieved with id ${retrievedOrder.id}`);

  return retrievedOrder;
}
