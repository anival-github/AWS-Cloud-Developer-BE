import { Construct } from 'constructs';
import { BlockPublicAccess, Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';

interface S3ConstructProps {
  BUCKET_NAME: string;
}

export class S3Construct extends Construct {
  readonly filesBucket: Bucket;

  constructor(scope: Construct, id: string, props: S3ConstructProps) {
    super(scope, id);

    const {
      BUCKET_NAME,
    } = props;

    const filesBucket = new Bucket(this, 'ImportServiceStatickBucket', {
      bucketName: BUCKET_NAME,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      cors: [
        {
          allowedMethods: [
            HttpMethods.GET,
            HttpMethods.POST,
            HttpMethods.PUT,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });

    this.filesBucket = filesBucket;
  }
}
