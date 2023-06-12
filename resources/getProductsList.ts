import { APIGatewayProxyResult } from 'aws-lambda';
import { products } from './data';

export const handler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const data = await Promise.resolve(JSON.stringify(products));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: data,
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
