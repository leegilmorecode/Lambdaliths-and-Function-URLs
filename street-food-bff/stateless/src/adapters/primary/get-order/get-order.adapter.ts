import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  MetricUnits,
  Metrics,
  logMetrics,
} from '@aws-lambda-powertools/metrics';
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { errorHandler, logger } from '@shared/index';

import { Order } from '@dto/orders';
import { ValidationError } from '@errors/validation-error';
import { getOrderUseCase } from '@use-cases/get-order';
import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';

const tracer = new Tracer();
const metrics = new Metrics();

export const getOrderAdapter = async ({
  pathParameters,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!pathParameters || !pathParameters.id)
      throw new ValidationError('order id not supplied');

    const orderId = pathParameters['id'];
    const created: Order = await getOrderUseCase(orderId);

    metrics.addMetric('SuccessfulGetOrder', MetricUnits.Count, 1);

    return {
      statusCode: 200,
      body: JSON.stringify(created),
    };
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    logger.error(errorMessage);

    metrics.addMetric('GetOrderError', MetricUnits.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(getOrderAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
