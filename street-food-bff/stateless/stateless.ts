import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

import { Construct } from 'constructs';

export class StreetFoodStatelessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // constants
    const serviceName = 'StreetFoodWebService';
    const metricNamespace = 'StreetFoodService';

    // add our lambda config
    const lambdaConfig = {
      LOG_LEVEL: 'DEBUG',
      POWERTOOLS_LOGGER_LOG_EVENT: 'true',
      POWERTOOLS_LOGGER_SAMPLE_RATE: '1',
      POWERTOOLS_TRACE_ENABLED: 'enabled',
      POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS: 'captureHTTPsRequests',
      POWERTOOLS_SERVICE_NAME: serviceName,
      POWERTOOLS_TRACER_CAPTURE_RESPONSE: 'captureResult',
      POWERTOOLS_METRICS_NAMESPACE: metricNamespace,
    };

    // import the function url from the orders domain service (lambdalith)
    // note: if this was cross account this would need to be from a meta service lookup for the account id
    const ordersUrl = cdk.Fn.importValue('OrderServiceLambdaUrl');

    // create the lambda function for create order
    const createOrderLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'CreateOrderLambda', {
        functionName: 'create-order-lambda',
        description: 'create order lambda',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          './src/adapters/primary/create-order/create-order.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        architecture: lambda.Architecture.ARM_64,
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ORDERS_URL: ordersUrl,
          ...lambdaConfig,
        },
      });

    // create the lambda function for retrieving an order
    const getOrderLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'GetOrderLambda', {
        functionName: 'get-order-lambda',
        description: 'get order lambda',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          './src/adapters/primary/get-order/get-order.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        architecture: lambda.Architecture.ARM_64,
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ORDERS_URL: ordersUrl,
          ...lambdaConfig,
        },
      });

    const functionUrlPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['lambda:InvokeFunctionUrl'],
      resources: [
        // this is the same account in this instance but could be a separate account
        `arn:aws:lambda:eu-west-1:${this.account}:function:orders-service-lambda`,
      ],
    });

    // ensure that the lambda functions are able to invokeFunctionUrl on the orders service
    createOrderLambda.addToRolePolicy(functionUrlPolicyStatement);
    getOrderLambda.addToRolePolicy(functionUrlPolicyStatement);

    // create the api for the experience layer (public facing for placing orders)
    const api: apigw.RestApi = new apigw.RestApi(this, 'ExternalApi', {
      description: 'external street food api',
      restApiName: 'extenal-api',
      deploy: true,
      endpointTypes: [apigw.EndpointType.REGIONAL],
      deployOptions: {
        stageName: 'prod',
        dataTraceEnabled: true,
        loggingLevel: apigw.MethodLoggingLevel.INFO,
        tracingEnabled: true,
        metricsEnabled: true,
      },
    });

    // create our orders resource
    const apiRoot: apigw.Resource = api.root.addResource('v1');
    const createOrderResource: apigw.Resource = apiRoot.addResource('orders');
    const getOrderResource: apigw.Resource =
      createOrderResource.addResource('{id}');

    // add the lambda integration for create orders
    createOrderResource.addMethod(
      'POST',
      new apigw.LambdaIntegration(createOrderLambda, {
        proxy: true,
      })
    );

    // add the lambda integration for getting an order
    getOrderResource.addMethod(
      'GET',
      new apigw.LambdaIntegration(getOrderLambda, {
        proxy: true,
      })
    );
  }
}
