import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

interface ProductServiceConstructProps {
  productsTable: Table;
  stocksTable: Table;
  createProductTopic: Topic;
}

export class LambdasConstruct extends Construct {
  readonly getProductsListLambda: NodejsFunction;
  readonly getProductsByIdLambda: NodejsFunction;
  readonly getSwaggerDocsLambda: NodejsFunction;
  readonly createProductLambda: NodejsFunction;
  readonly catalogBatchProcessLambda: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    props: ProductServiceConstructProps
  ) {
    super(scope, id);

    const { productsTable, stocksTable, createProductTopic } = props;

    const commonLambdaEnvVars = {
      PRODUCTS_DB: productsTable.tableName,
      STOCKS_DB: stocksTable.tableName,
    };

    const catalogItemsQueue = new Queue(this, 'catalogItemsQueue', {
      queueName: 'catalogItemsQueue',
    });

    const eventSource = new SqsEventSource(
      catalogItemsQueue,
      {
        batchSize: 5,
      }
    );

    const catalogBatchProcessLambda = new NodejsFunction(
      this,
      'CatalogBatchProcessLambda',
      {
        runtime: Runtime.NODEJS_18_X,
        entry: 'src/lambdas/catalogBatchProcess.ts',
        environment: {
          IMPORT_PRODUCTS_TOPIC_ARN: createProductTopic.topicArn,
          ...commonLambdaEnvVars,
        },
      }
    );

    catalogBatchProcessLambda.addEventSource(eventSource);

    const getProductsListLambda = new NodejsFunction(
      this,
      'GetProductsListLambda',
      {
        runtime: Runtime.NODEJS_18_X,
        entry: 'src/lambdas/getProductsList.ts',
        environment: commonLambdaEnvVars,
      }
    );

    const getProductsByIdLambda = new NodejsFunction(
      this,
      'GetProductsByIdLambda',
      {
        runtime: Runtime.NODEJS_18_X,
        entry: 'src/lambdas/getProductsById.ts',
        environment: commonLambdaEnvVars,
      }
    );

    const createProductLambda = new NodejsFunction(
      this,
      'CreateProductLambda',
      {
        runtime: Runtime.NODEJS_18_X,
        entry: 'src/lambdas/createProduct.ts',
        environment: commonLambdaEnvVars,
      }
    );

    const getSwaggerDocsLambda = new NodejsFunction(
      this,
      'GetSwaggerDocsLambda',
      {
        runtime: Runtime.NODEJS_18_X,
        entry: 'src/lambdas/getSwaggerDocs.ts',
        environment: commonLambdaEnvVars,
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

    createProductTopic.grantPublish(catalogBatchProcessLambda);

    this.getProductsListLambda = getProductsListLambda;
    this.getProductsByIdLambda = getProductsByIdLambda;
    this.getSwaggerDocsLambda = getSwaggerDocsLambda;
    this.createProductLambda = createProductLambda;
    this.catalogBatchProcessLambda = catalogBatchProcessLambda;
  }
}
