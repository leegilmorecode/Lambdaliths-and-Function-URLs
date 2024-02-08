import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

import { Construct } from 'constructs';

export interface OrdersDomainStatelessStackProps extends cdk.StackProps {
  table: dynamodb.Table;
}

export class OrdersDomainStatelessStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: OrdersDomainStatelessStackProps
  ) {
    super(scope, id, props);

    // constants
    const serviceName = 'StreetFoodOrdersService';
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

    // create the lambdalith for the orders service
    const orderServiceLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'OrdersServiceLambda', {
        functionName: 'orders-service-lambda',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          './src/adapters/primary/orders-service/orders-service.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        description: 'orders service lambdalith',
        architecture: lambda.Architecture.ARM_64,
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaConfig,
          TABLE_NAME: props.table.tableName,
        },
      });

    // we add the function url for our internal lambdalith
    const orderServiceLambdaUrl = orderServiceLambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.AWS_IAM,
      invokeMode: lambda.InvokeMode.BUFFERED,
      cors: {
        allowedOrigins: ['*'],
      },
    });

    // add a resource policy which in this example allows requests
    // from services in the same account (typically this would be cross-account)
    orderServiceLambda.addPermission('ResourcePolicy', {
      principal: new iam.AccountPrincipal(this.account),
      action: 'lambda:InvokeFunctionUrl',
      functionUrlAuthType: lambda.FunctionUrlAuthType.AWS_IAM,
      sourceAccount: this.account,
    });

    // ensure the lambdalith service has access to the orders table
    props.table.grantReadWriteData(orderServiceLambda);

    // export the function url
    new cdk.CfnOutput(this, 'OrderServiceLambdaUrl', {
      value: orderServiceLambdaUrl.url,
      exportName: 'OrderServiceLambdaUrl',
    });
  }
}
