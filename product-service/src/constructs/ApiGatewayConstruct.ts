import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

export interface ApiGatewayConstructProps {
  getProductsListLambda: NodejsFunction,
  getProductsByIdLambda: NodejsFunction,
  getSwaggerDocsLambda: NodejsFunction,
  createProductLambda: NodejsFunction,
}

export class ApiGatewayConstruct extends Construct {
  constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
    super(scope, id);

    const { getProductsListLambda, getProductsByIdLambda, getSwaggerDocsLambda, createProductLambda } = props;

    const api = new RestApi(this, 'products-api', {
      restApiName: 'Product Service',
      description: 'This service serves products.',
    });

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

    productsResource.addMethod('GET', new LambdaIntegration(getProductsListLambda));
    productsResource.addMethod('POST', new LambdaIntegration(createProductLambda));

    const swaggerResource = api.root.addResource('swagger');
    swaggerResource.addMethod('GET', new LambdaIntegration(getSwaggerDocsLambda));

    const productsIdResource = productsResource.addResource('{id}');
    productsIdResource.addMethod('GET', new LambdaIntegration(getProductsByIdLambda));
  }
}
