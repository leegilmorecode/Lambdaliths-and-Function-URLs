#!/usr/bin/env node

import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { StreetFoodStatelessStack } from '../stateless/stateless';

const app = new cdk.App();
new StreetFoodStatelessStack(app, 'StreetFoodStatelessStack', {});
