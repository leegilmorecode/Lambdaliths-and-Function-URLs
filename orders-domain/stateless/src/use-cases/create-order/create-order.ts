import { NewOrder, Order } from '@dto/orders';
import { getISOString, logger, schemaValidator } from '@shared/index';

import { createOrder } from '@adapters/secondary/database-adapter';
import { schema as createOrderSchema } from './create-order.schema';
import { schema } from '@schemas/order';
import { v4 as uuid } from 'uuid';

export async function createOrderUseCase(newOrder: NewOrder): Promise<Order> {
  logger.info(`new order: ${JSON.stringify(newOrder)}`);

  // validate the schema for the new order
  schemaValidator(createOrderSchema, newOrder);

  // create the order object with a new id and created date
  const createdDate = getISOString();
  const order: Order = {
    id: uuid(),
    created: createdDate,
    ...newOrder,
  };

  // validate the schema here to ensure it is correct before saving
  schemaValidator(schema, order);

  // save the order to the table
  await createOrder(order);

  logger.info(
    `order created with id ${order.id} and created date: ${order.created}`
  );

  return order;
}
