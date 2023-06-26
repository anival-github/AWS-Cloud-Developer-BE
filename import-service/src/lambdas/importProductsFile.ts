import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { createPresignedUrlWithClient } from '../utils/createPresignedUrlWithClient';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log(`Request: ${event?.path}, Body: ${event?.body}, queryStringParameters: ${event?.queryStringParameters}`);

    const REGION = "us-east-1";
    const BUCKET = process.env.BUCKET_NAME;
    const KEY = `uploaded/${event?.queryStringParameters?.name}`

    const clientUrl = await createPresignedUrlWithClient({
      region: REGION,
      bucket: BUCKET as string,
      key: KEY,
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: JSON.stringify({ signedURL: clientUrl }),
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
}