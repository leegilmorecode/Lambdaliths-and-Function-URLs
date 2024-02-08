import { app } from './orders-app';
import awsLambdaFastify from '@fastify/aws-lambda';

export const handler = awsLambdaFastify(app);
