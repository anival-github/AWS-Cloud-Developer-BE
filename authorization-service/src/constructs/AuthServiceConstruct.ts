import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import config from '../config/config';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class AuthServiceConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const {
      PASSWORD_KEY,
      TEST_PASSWORD,
    } = config;

    new NodejsFunction(
      this,
      'basicAuthorizer',
      {
        entry: 'src/handlers/basicAuthorizer.ts',
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          PASSWORD_KEY,
          TEST_PASSWORD,
        },
      }
    );
  }
}
