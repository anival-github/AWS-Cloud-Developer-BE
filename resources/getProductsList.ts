import { APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
const dynamo = new AWS.DynamoDB.DocumentClient();

export const handler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const [productsDbResponse, stocksDbResponse] = await Promise.all([
      dynamo.scan({ TableName: process.env.PRODUCTS_DB! }).promise(),
      dynamo.scan({ TableName: process.env.STOCKS_DB! }).promise(),
    ]);

    const productList = productsDbResponse?.Items || [];
    const stocksList = stocksDbResponse?.Items || [];

    const productsWithStocks = productList.map((product) => {
      const stockItem = stocksList.find((stock) => stock.product_id === product.id);

      return {
        ...product,
        count: stockItem?.count || 0,
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: JSON.stringify(productsWithStocks),
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
