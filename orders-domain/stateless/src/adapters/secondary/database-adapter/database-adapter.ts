import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { Order } from '@dto/orders';
import { ResourceNotFoundError } from '@errors/resource-not-found';
import { config } from '@config';
import { logger } from '@shared/index';

const dynamoDb = new DynamoDBClient({});

export async function getOrderById(orderId: string): Promise<Order> {
  const tableName = config.get('tableName');

  const params = {
    TableName: tableName,
    Key: {
      id: { S: orderId },
    },
  };

  try {
    const data = await dynamoDb.send(new GetItemCommand(params));

    if (!data.Item) {
      throw new ResourceNotFoundError(`order with ID ${orderId} not found`);
    }

    const order = unmarshall(data.Item) as Order;

    logger.info(`order with ID ${orderId} retrieved successfully`);

    return order;
  } catch (error) {
    console.error('error retrieving order:', error);
    throw error;
  }
}

export async function createOrder(newOrder: Order): Promise<Order> {
  const tableName = config.get('tableName');

  const params = {
    TableName: tableName,
    Item: marshall(newOrder),
  };

  try {
    await dynamoDb.send(new PutItemCommand(params));

    logger.info(`order created with ${newOrder.id} into ${tableName}`);

    return newOrder;
  } catch (error) {
    console.error('error creating order:', error);
    throw error;
  }
}
