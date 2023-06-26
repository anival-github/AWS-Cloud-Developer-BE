import { APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import { createProduct } from '../dynamoDb/createProduct';
import { CreateProductDto } from '../types/createProductDto';

const snsClient = new AWS.SNS();

export const handler = async (
  event: SQSEvent
): Promise<{
  statusCode: number,
  body: string,
}> => {
  try {
    const records = event?.Records || [];
    console.log('Records', records);

    const IMPORT_PRODUCTS_TOPIC_ARN = process.env.IMPORT_PRODUCTS_TOPIC_ARN as string;


    for (const record of records) {
      const productData = JSON.parse(record.body);

      const {
        count = 0,
        price,
        title,
        description,
      } = productData || {};

      // console.log('count typeof: ', typeof Number(count));
      // console.log('price typeof: ', typeof Number(price));
      // console.log('title typeof: ', typeof title);
      // console.log('description typeof: ', typeof description);
  
      const isDataCorrect = typeof price === 'number' && typeof title === 'string' && typeof description === 'string' && typeof count === 'number';
  
      if (!isDataCorrect) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: `Product data is incorrect: ${productData}` }),
        }
      }
  
      const result = await createProduct(productData);

      console.log('result: ', result);

      await snsClient.publish({
        TopicArn: IMPORT_PRODUCTS_TOPIC_ARN,
        Message: JSON.stringify(result),
        Subject: 'New Files Added to Catalog',
      })
    }

    return {
      statusCode: 200,
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
