import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { products } from './data';

const getProductIdFromPath = (path: string) => {
  const urlParams = path.split('/').filter(Boolean);
  const productsKeyIndex = urlParams.findIndex((item) => item === 'products');
  const productIdIndex = productsKeyIndex + 1;
  const productId = urlParams[productIdIndex];
  return productId;
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const productId = getProductIdFromPath(event.path);

    const productList = await Promise.resolve(products);

    const product = productList.find((item) => item.id === productId);

    if (product) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Headers" : "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(product),
      };
    }

    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: 'Product not found',
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'some error happened',
      }),
    };
  }
};
