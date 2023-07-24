import { Stack, StackProps, App } from 'aws-cdk-lib';
import { LambdasConstruct } from '../constructs/LambdasConstruct';
import { ApiGatewayConstruct } from '../constructs/ApiGatewayConstruct';
import { SnsConstruct } from '../constructs/SnsConstruct';
import { DynamoDbConstruct } from '../constructs/DynamoDbConstruct';
import config from '../config/config';

export class ProductServiceStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const {
      SNS_BIG_STOCK_EMAIL,
      SNS_ADDITIONAL_EMAIL,
      PRODUCTS_TABLE_NAME,
      STOCKS_TABLE_NAME,
    } = config;

    const snsConstruct = new SnsConstruct(this, 'Sns', {
      SNS_BIG_STOCK_EMAIL,
      SNS_ADDITIONAL_EMAIL,
    });

    const dynamoDbConstruct = new DynamoDbConstruct(this, 'DynamoDb', {
      PRODUCTS_TABLE_NAME,
      STOCKS_TABLE_NAME,
    });

    const lambdasConstruct = new LambdasConstruct(
      this,
      'ProductServiceConstruct',
      {
        productsTable: dynamoDbConstruct.productsTable,
        stocksTable: dynamoDbConstruct.stocksTable,
        createProductTopic: snsConstruct.createProductTopic,
      }
    );

    new ApiGatewayConstruct(this, 'ApiGateway', {
      getProductsListLambda: lambdasConstruct.getProductsListLambda,
      getProductsByIdLambda: lambdasConstruct.getProductsByIdLambda,
      getSwaggerDocsLambda: lambdasConstruct.getSwaggerDocsLambda,
      createProductLambda: lambdasConstruct.createProductLambda,
    });
  }
}
