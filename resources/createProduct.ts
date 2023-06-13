import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import crypto from 'crypto';

const dynamo = new AWS.DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const uid = crypto.randomUUID();

    if (!event?.body) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        },
        body: JSON.stringify({ uid, type: typeof uid }),
      };
    }

    const requestBody = JSON.parse(event.body);

    const { count = 0, price, title, description } = requestBody || {};

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


    const result = await dynamo.transactWrite({
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
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      body: JSON.stringify({ result }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        err,
        CancellationReasons: err.CancellationReasons,
        TableName: process.env.PRODUCTS_DB!,
        TableName2: process.env.STOCKS_DB!,
      }),
    };
  }
};
