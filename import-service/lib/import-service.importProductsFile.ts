import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
// import * as AWS from 'aws-sdk';
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

const createPresignedUrlWithClient = ({ region, bucket, key }: { region: string, bucket: string, key: string }) => {
  const client = new S3Client({ region });
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

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

    // const [productsDbResponse, stocksDbResponse] = await Promise.all([
    //   dynamo.scan({ TableName: process.env.PRODUCTS_DB! }).promise(),
    //   dynamo.scan({ TableName: process.env.STOCKS_DB! }).promise(),
    // ]);

    // const productList = productsDbResponse?.Items || [];
    // const stocksList = stocksDbResponse?.Items || [];

    // const productsWithStocks = productList.map((product) => {
    //   const stockItem = stocksList.find((stock) => stock.product_id === product.id);

    //   return {
    //     ...product,
    //     count: stockItem?.count || 0,
    //   };
    // });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: clientUrl,
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
