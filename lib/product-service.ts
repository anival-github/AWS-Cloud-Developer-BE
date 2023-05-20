import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class ProductService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const getProductsListHandler = new lambda.Function(this, "GetProductsListHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("build"),
      handler: "getProductsList.handler",
    });

    const getProductsByIdHandler = new lambda.Function(this, "GetProductsByIdHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("build"),
      handler: "getProductsById.handler",
    });

    const api = new apigateway.RestApi(this, "products-api", {
      restApiName: "Product Service",
      description: "This service serves products."
    });

    const getProductsListHandlerIntegration = new apigateway.LambdaIntegration(getProductsListHandler);
    const getProductByIdHandlerIntegration = new apigateway.LambdaIntegration(getProductsByIdHandler);

    const productsResource = api.root.addResource("products");
    productsResource.addMethod("GET", getProductsListHandlerIntegration);

    const productsIdResource = productsResource.addResource("{id}");
    productsIdResource.addMethod("GET", getProductByIdHandlerIntegration)
  }
}