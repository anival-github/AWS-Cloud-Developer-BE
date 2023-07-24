import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Effect, Role, ServicePrincipal, PolicyStatement, Policy } from 'aws-cdk-lib/aws-iam';
import { AuthorizationType, Cors, IdentitySource, LambdaIntegration, ResponseType, RestApi, TokenAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { Duration } from 'aws-cdk-lib';

interface ApiGatewayConstructProps {
  AUTH_LAMBDA_ARN: string;
  importProductsFileLambda: NodejsFunction;
}

export class ApiGatewayConstruct extends Construct {
  constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
    super(scope, id);

    const { AUTH_LAMBDA_ARN, importProductsFileLambda } = props;

    const authLambda = NodejsFunction.fromFunctionArn(
      this,
      'authLambda',
      AUTH_LAMBDA_ARN
    );

    const invokeTokenAuthorizerRole = new Role(this, 'Role', {
      roleName: 'my-api-gateway-role',
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    const invokeTokenAuthorizerPolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      sid: 'AllowInvokeLambda',
      resources: ['*'],
      actions: ['lambda:InvokeFunction'],
    });

    new Policy(this, 'Policy', {
      policyName: 'my-api-gateway-policy',
      roles: [invokeTokenAuthorizerRole],
      statements: [invokeTokenAuthorizerPolicyStatement],
    });

    const authorizer = new TokenAuthorizer(
      this,
      'RequestAuthorizer',
      {
        handler: authLambda,
        identitySource: IdentitySource.header('authorization'),
        resultsCacheTtl: Duration.seconds(0),
        assumeRole: invokeTokenAuthorizerRole,
      }
    );

    const api = new RestApi(this, 'import-service-api', {
      restApiName: 'Import Service',
      description: 'This service allow import of files.',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: ['*'],
        allowCredentials: true,
      },
      defaultMethodOptions: {
        authorizer,
        authorizationType: AuthorizationType.CUSTOM,
      },
    });

    api.addGatewayResponse(`gatewayResponseDefault4XX`, {
      type: ResponseType.DEFAULT_4XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Credentials': "'true'",
        'Access-Control-Expose-Headers': "'*'",
      },
    });

    api.addGatewayResponse(`gatewayResponseDefault5XX`, {
      type: ResponseType.DEFAULT_5XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Credentials': "'true'",
        'Access-Control-Expose-Headers': "'*'",
      },
    });

    const importProductsFileHandlerIntegration =
      new LambdaIntegration(importProductsFileLambda, {
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
