import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import config from '../config/config';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ImportServiceConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const {
      BUCKET_NAME,
      CATALOG_ITEMS_QUEUE_ARN,
    } = config;

    const catalogItemsQueue = sqs.Queue.fromQueueArn(this, 'catalogItemsQueue', CATALOG_ITEMS_QUEUE_ARN);

    const filesBucket = new s3.Bucket(this, 'ImportServiceStatickBucket', {
      bucketName: BUCKET_NAME,
      // autoDeleteObjects: true,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const importProductsFileLambda = new NodejsFunction(
      this,
      'importProductsFile',
      {
        entry: 'src/lambdas/importProductsFile.ts',
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: { BUCKET_NAME },
      }
    );

    const importFileParserLambda = new NodejsFunction(
      this,
      'importFileParser',
      {
        entry: 'src/lambdas/importFileParser.ts',
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: { BUCKET_NAME, SQS_URL: catalogItemsQueue.queueUrl },
      }
    );

    catalogItemsQueue.grantSendMessages(importFileParserLambda);

    filesBucket.grantReadWrite(importProductsFileLambda);
    filesBucket.grantReadWrite(importFileParserLambda);

    filesBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3Notifications.LambdaDestination(importFileParserLambda),
      { prefix: 'uploaded/' }
    );

    const api = new apigateway.RestApi(this, 'import-service-api', {
      restApiName: 'Import Service',
      description: 'This service allow import of files.',
    });

    const importProductsFileHandlerIntegration =
      new apigateway.LambdaIntegration(importProductsFileLambda, {
        requestParameters: {
          'integration.request.querystring.name':
            'method.request.querystring.name',
        },
      });
    const importResource = api.root.addResource('import');

    importResource.addMethod('GET', importProductsFileHandlerIntegration, {
      requestParameters: {
        'method.request.querystring.name': true,
      },
    });
  }
}
