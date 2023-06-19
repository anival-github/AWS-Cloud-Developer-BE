import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import crypto from 'crypto';

const dynamo = new AWS.DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log(`Request: ${event?.path}, Body: ${event?.body}`);

    const body = event?.body;

    if (!event?.body) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        },
        body: JSON.stringify({ message: "Please provide product data" }),
      };
    }

    const requestBody = JSON.parse(event.body);
    const { count = 0, price, title, description } = requestBody || {};

    const isDataCorrect = typeof price === 'number' && typeof title === 'string' && typeof description === 'string' && typeof count === 'number';

    if (!isDataCorrect) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        },
        body: JSON.stringify({ message: "Product data is invalid" }),
      };
    }

    const uid = crypto.randomUUID();

    const newProductItem = {
      id: uid,
      price,
      title,
      description,
    };

    const newStockItem = {
      product_id: uid,
      count,
    };

    await dynamo.transactWrite({
      TransactItems: [
        {
          Put: {
            TableName: process.env.PRODUCTS_DB!,
            Item: newProductItem,
          },
        },
        {
          Put: {
            TableName: process.env.STOCKS_DB!,
            Item: newStockItem,
          },
        },
      ],
    }).promise();

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      body: JSON.stringify({ message: 'Created' }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Some error occured'
      }),
    };
  }
};
