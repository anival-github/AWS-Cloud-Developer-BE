import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSource from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sns from 'aws-cdk-lib/aws-sns';
import config from '../config/config';

export class ProductServiceConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME, SNS_BIG_STOCK_EMAIL } = config;

    const catalogItemsQueue = new sqs.Queue(this, 'catalogItemsQueue', {
      queueName: 'catalogItemsQueue',
    });

    const eventSource = new lambdaEventSource.SqsEventSource(catalogItemsQueue, {
      batchSize: 5,
    });

    const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
      topicName: 'create-product-topic',
    })

    new sns.Subscription(this, 'BigStockSubscription', {
      endpoint: SNS_BIG_STOCK_EMAIL,
      protocol: sns.SubscriptionProtocol.EMAIL,
      topic: createProductTopic,
    })

    const catalogBatchProcessLambda = new NodejsFunction(
      this,
      'CatalogBatchProcessLambda',
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: 'src/lambdas/catalogBatchProcess.ts',
        environment: {
          IMPORT_PRODUCTS_TOPIC_ARN: createProductTopic.topicArn,
          PRODUCTS_DB: PRODUCTS_TABLE_NAME,
          STOCKS_DB: STOCKS_TABLE_NAME,
        }
      }
    );

    catalogBatchProcessLambda.addEventSource(eventSource);

    const productsTable = new dynamodb.Table(this, PRODUCTS_TABLE_NAME, {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: PRODUCTS_TABLE_NAME,
    });

    const stocksTable = new dynamodb.Table(this, STOCKS_TABLE_NAME, {
      partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
      tableName: STOCKS_TABLE_NAME,
    });

    const getProductsListLambda = new NodejsFunction(this, 'GetProductsListLambda', {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: 'src/lambdas/getProductsList.ts',
        environment: {
          PRODUCTS_DB: PRODUCTS_TABLE_NAME,
          STOCKS_DB: STOCKS_TABLE_NAME,
        },
      }
    );

    const getProductsByIdLambda = new NodejsFunction(
      this,
      'GetProductsByIdLambda',
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: 'src/lambdas/getProductsById.ts',
        environment: {
          PRODUCTS_DB: PRODUCTS_TABLE_NAME,
          STOCKS_DB: STOCKS_TABLE_NAME,
        },
      }
    );

    const createProductLambda = new NodejsFunction(
      this,
      'CreateProductLambda',
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: 'src/lambdas/createProduct.ts',
        environment: {
          PRODUCTS_DB: PRODUCTS_TABLE_NAME,
          STOCKS_DB: STOCKS_TABLE_NAME,
        },
      }
    );

    const getSwaggerDocsLambda = new NodejsFunction(
      this,
      'GetSwaggerDocsLambda',
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: 'src/lambdas/getSwaggerDocs.ts',
        environment: {
          PRODUCTS_DB: PRODUCTS_TABLE_NAME,
          STOCKS_DB: STOCKS_TABLE_NAME,
        },
      }
    );

    productsTable.grantFullAccess(getProductsListLambda);
    productsTable.grantFullAccess(getProductsByIdLambda);
    productsTable.grantFullAccess(createProductLambda);
    productsTable.grantFullAccess(catalogBatchProcessLambda);

    stocksTable.grantFullAccess(getProductsListLambda);
    stocksTable.grantFullAccess(getProductsByIdLambda);
    stocksTable.grantFullAccess(createProductLambda);
    stocksTable.grantFullAccess(catalogBatchProcessLambda);

    const api = new apigateway.RestApi(this, 'products-api', {
      restApiName: 'Product Service',
      description: 'This service serves products.',
    });

    const getProductsListLambdaIntegration = new apigateway.LambdaIntegration(
      getProductsListLambda
    );
    const getProductByIdHandlerIntegration = new apigateway.LambdaIntegration(
      getProductsByIdLambda
    );
    const getSwaggerDocsLambdaIntegration = new apigateway.LambdaIntegration(
      getSwaggerDocsLambda
    );
    const createProductLambdaIntegration = new apigateway.LambdaIntegration(
      createProductLambda
    );

    const productsResource = api.root.addResource('products');

    productsResource.addCorsPreflight({
      allowHeaders: [
        'Content-Type',
        'X-Amz-Date',
        'Authorization',
        'X-Api-Key',
      ],
      allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowCredentials: true,
      allowOrigins: ['*'],
    });

    productsResource.addMethod('GET', getProductsListLambdaIntegration);
    productsResource.addMethod('POST', createProductLambdaIntegration);

    const swaggerResource = api.root.addResource('swagger');
    swaggerResource.addMethod('GET', getSwaggerDocsLambdaIntegration);

    const productsIdResource = productsResource.addResource('{id}');
    productsIdResource.addMethod('GET', getProductByIdHandlerIntegration);

    createProductTopic.grantPublish(catalogBatchProcessLambda);
  }
}
