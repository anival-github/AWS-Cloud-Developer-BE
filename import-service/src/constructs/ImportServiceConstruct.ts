import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

interface ImportServiceConstructProps {
  filesBucket: Bucket;
  CATALOG_ITEMS_QUEUE_ARN: string;
}
export class ImportServiceConstruct extends Construct {
  readonly importProductsFileLambda: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    props: ImportServiceConstructProps
  ) {
    super(scope, id);

    const { filesBucket, CATALOG_ITEMS_QUEUE_ARN } = props;

    const catalogItemsQueue = Queue.fromQueueArn(
      this,
      'catalogItemsQueue',
      CATALOG_ITEMS_QUEUE_ARN
    );

    const importProductsFileLambda = new NodejsFunction(
      this,
      'importProductsFile',
      {
        entry: 'src/lambdas/importProductsFile.ts',
        runtime: Runtime.NODEJS_18_X,
        environment: { BUCKET_NAME: filesBucket.bucketName },
      }
    );

    const importFileParserLambda = new NodejsFunction(
      this,
      'importFileParser',
      {
        entry: 'src/lambdas/importFileParser.ts',
        runtime: Runtime.NODEJS_18_X,
        environment: {
          BUCKET_NAME: filesBucket.bucketName,
          SQS_URL: catalogItemsQueue.queueUrl,
        },
      }
    );

    catalogItemsQueue.grantSendMessages(importFileParserLambda);

    filesBucket.grantReadWrite(importProductsFileLambda);
    filesBucket.grantReadWrite(importFileParserLambda);

    filesBucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(importFileParserLambda),
      { prefix: 'uploaded/' }
    );

    this.importProductsFileLambda = importProductsFileLambda;
  }
}
