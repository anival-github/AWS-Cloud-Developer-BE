import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class ProductService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const productsTable = new dynamodb.Table(this, 'AWS-Cloud-Developer-BE-2023-products-0.0.1', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'AWS-Cloud-Developer-BE-2023-products-0.0.1'
    });

    const stocksTable = new dynamodb.Table(this, 'AWS-Cloud-Developer-BE-2023-stocks-0.0.1', {
      partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
      tableName: 'AWS-Cloud-Developer-BE-2023-stocks-0.0.1'
    });

    const getProductsListHandler = new lambda.Function(this, "GetProductsListHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("build"),
      handler: "getProductsList.handler",
      environment: {
        PRODUCTS_DB: 'AWS-Cloud-Developer-BE-2023-products-0.0.1',
        STOCKS_DB: 'AWS-Cloud-Developer-BE-2023-stocks-0.0.1',
      },
    });

    const getProductsByIdHandler = new lambda.Function(this, "GetProductsByIdHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("build"),
      handler: "getProductsById.handler",
      environment: {
        PRODUCTS_DB: 'AWS-Cloud-Developer-BE-2023-products-0.0.1',
        STOCKS_DB: 'AWS-Cloud-Developer-BE-2023-stocks-0.0.1',
      }
    });

    const createProductHandler = new lambda.Function(this, "CreateProductHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("build"),
      handler: "createProduct.handler",
      environment: {
        PRODUCTS_DB: 'AWS-Cloud-Developer-BE-2023-products-0.0.1',
        STOCKS_DB: 'AWS-Cloud-Developer-BE-2023-stocks-0.0.1',
      }
    });

    const getSwaggerDocsHandler = new lambda.Function(this, "GetSwaggerDocsHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("build"),
      handler: "getSwaggerDocs.handler",
    });

    productsTable.grantFullAccess(getProductsListHandler);
    productsTable.grantFullAccess(getProductsByIdHandler);
    productsTable.grantFullAccess(createProductHandler);

    stocksTable.grantFullAccess(getProductsListHandler);
    stocksTable.grantFullAccess(getProductsByIdHandler);
    stocksTable.grantFullAccess(createProductHandler);

    const api = new apigateway.RestApi(this, "products-api", {
      restApiName: "Product Service",
      description: "This service serves products."
    });

    const getProductsListHandlerIntegration = new apigateway.LambdaIntegration(getProductsListHandler);
    const getProductByIdHandlerIntegration = new apigateway.LambdaIntegration(getProductsByIdHandler);
    const getSwaggerDocsHandlerIntegration = new apigateway.LambdaIntegration(getSwaggerDocsHandler);
    const createProductHandlerIntegration = new apigateway.LambdaIntegration(createProductHandler);

    const productsResource = api.root.addResource("products");

    productsResource.addCorsPreflight({
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
      allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowCredentials: true,
      allowOrigins: ['*'],
    });

    productsResource.addMethod("GET", getProductsListHandlerIntegration);
    productsResource.addMethod("POST", createProductHandlerIntegration);

    const swaggerResource = api.root.addResource("swagger");
    swaggerResource.addMethod("GET", getSwaggerDocsHandlerIntegration);

    const productsIdResource = productsResource.addResource("{id}");
    productsIdResource.addMethod("GET", getProductByIdHandlerIntegration)
  }
}