import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import crypto from 'crypto';
import { createProduct } from '../dynamoDb/createProduct';
import { CreateProductDto } from '../types/createProductDto';

const dynamo = new AWS.DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log(`Request: ${event?.path}, Body: ${event?.body}`);

    if (!event?.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Please provide product data" }),
      };
    }

    const requestBody = event.body as unknown as CreateProductDto;
    // const requestBody = JSON.parse(event.body);
    const { count = 0, price, title, description } = requestBody || {};

    const isDataCorrect = typeof price === 'number' && typeof title === 'string' && typeof description === 'string' && typeof count === 'number';

    if (!isDataCorrect) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Product data is invalid" }),
      };
    }

    const {
      message,
      productId,
    } = await createProduct({
      price,
      title,
      description,
      count,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        message,
        productId,
      }),
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
