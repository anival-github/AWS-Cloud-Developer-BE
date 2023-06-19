import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
const dynamo = new AWS.DynamoDB.DocumentClient();

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
    console.log(`Request: ${event?.path}, Body: ${event?.body}`);
    const productId = getProductIdFromPath(event.path);

    const [productsDbResponse, stocksDbResponse] = await Promise.all([
      dynamo.scan({ TableName: process.env.PRODUCTS_DB! }).promise(),
      dynamo.scan({ TableName: process.env.STOCKS_DB! }).promise(),
    ]);

    const productList = productsDbResponse?.Items || [];
    const stocksList = stocksDbResponse?.Items || [];

    const product = productList.find((item) => item.id === productId);

    if (!product) {
      return {
        statusCode: 204,
        headers: {
          "Access-Control-Allow-Headers" : "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: 'Product not found',
      };  
    }

    const stockItem = stocksList.find((stock) => stock.product_id === product.id);
    const productWithStock = { ...product, count: stockItem?.count || 0 };

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: JSON.stringify(productWithStock),
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
