import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import config from './config';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class ImportService extends Construct {

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const filesBucket = new s3.Bucket(this, "ImportServiceStatickBucket", {
      bucketName: config.BUCKET_NAME,
      // autoDeleteObjects: true,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const importProductsFileLambda = new NodejsFunction(this, 'importProductsFile', {runtime: lambda.Runtime.NODEJS_18_X,environment: {BUCKET_NAME: config.BUCKET_NAME}});
    const importFileParserLambda = new NodejsFunction(this, 'importFileParser', {runtime: lambda.Runtime.NODEJS_18_X,environment: {BUCKET_NAME: config.BUCKET_NAME}});

    filesBucket.grantReadWrite(importProductsFileLambda);
    filesBucket.grantReadWrite(importFileParserLambda);

    filesBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3Notifications.LambdaDestination(importFileParserLambda),   { prefix: 'uploaded/' });

    const api = new apigateway.RestApi(this, "import-service-api", {
      restApiName: "Import Service",
      description: "This service allow import of files."
    });

    const importProductsFileHandlerIntegration = new apigateway.LambdaIntegration(importProductsFileLambda, {
      requestParameters: {
        "integration.request.querystring.name": "method.request.querystring.name", 
      },
    });
    const importResource = api.root.addResource("import");

    importResource.addMethod("GET", importProductsFileHandlerIntegration, {
      requestParameters: {
        "method.request.querystring.name": true,
      }
    }
    );
  }
}
