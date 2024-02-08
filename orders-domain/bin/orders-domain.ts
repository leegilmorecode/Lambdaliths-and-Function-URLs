#!/usr/bin/env node

import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { OrdersDomainStatefulStack } from '../stateful/stateful';
import { OrdersDomainStatelessStack } from '../stateless/stateless';

const app = new cdk.App();
const statefulStack = new OrdersDomainStatefulStack(
  app,
  'OrdersDomainStatefulStack',
  {
    tableName: 'orders-domain-table',
  }
);
new OrdersDomainStatelessStack(app, 'OrdersDomainStatelessStack', {
  table: statefulStack.table,
});
