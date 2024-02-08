import { Order } from '@dto/orders';
import { ValidationError } from '@errors/validation-error';
import { getOrderById } from '@adapters/secondary/database-adapter';
import { logger } from '@shared/index';

export async function getOrderUseCase(
  orderId: string | undefined
): Promise<Order> {
  if (!orderId) throw new ValidationError('order id not supplied');

  // get the order by id using our secondary adapter
  const order: Order = await getOrderById(orderId);

  logger.info(`order retrieved with id ${order.id}`);

  return order;
}
