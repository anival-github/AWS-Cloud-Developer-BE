import { Stack, StackProps, App } from 'aws-cdk-lib';
import { ApiGatewayConstruct } from '../constructs/ApiGatewayConstruct';
import config from '../config/config';
import { ImportServiceConstruct } from '../constructs/ImportServiceConstruct';
import { S3Construct } from '../constructs/S3Construct';

export class ImportServiceStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const { AUTH_LAMBDA_ARN, BUCKET_NAME, CATALOG_ITEMS_QUEUE_ARN } = config;

    const s3Construct = new S3Construct(this, 'S3Construct', { BUCKET_NAME });

    const importServiceConstruct = new ImportServiceConstruct(
      this,
      'importServiceConstruct',
      { filesBucket: s3Construct.filesBucket, CATALOG_ITEMS_QUEUE_ARN }
    );

    new ApiGatewayConstruct(this, 'ApiGateway', {
      AUTH_LAMBDA_ARN,
      importProductsFileLambda: importServiceConstruct.importProductsFileLambda,
    });
  }
}
