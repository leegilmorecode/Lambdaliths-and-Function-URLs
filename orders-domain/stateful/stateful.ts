import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

import { Construct } from 'constructs';

export interface OrdersDomainStatefulStackProps extends cdk.StackProps {
  tableName: string;
}

export class OrdersDomainStatefulStack extends cdk.Stack {
  public table: dynamodb.Table;

  constructor(
    scope: Construct,
    id: string,
    props: OrdersDomainStatefulStackProps
  ) {
    super(scope, id, props);

    // create the orders domain service dynamodb table
    this.table = new dynamodb.Table(this, 'OrdersDomainTable', {
      tableName: props.tableName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });
  }
}
