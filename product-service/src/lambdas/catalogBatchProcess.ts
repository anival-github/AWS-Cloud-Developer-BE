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

    const createProductPromises = records.map((record) => {
      const productData: CreateProductDto = JSON.parse(record.body);

      const title = productData?.title;
      const description = productData?.description;
      const count = productData?.count;
      const price = productData?.price;

      console.log(`title: ${title}, description: ${description}, count: ${count}, price: ${price}`);
  
      if (!title || !description || !count || !price) {
        return Promise.reject({
          statusCode: 400,
          body: JSON.stringify({ message: `Product data is incorrect: ${productData}` }),
        })
      }

      return createProduct({title,description,count,price})
      .catch(err => `Some error occured during product creation: ${err}`)
      .then(result => snsClient.publish({
        TopicArn: IMPORT_PRODUCTS_TOPIC_ARN,
        Message: JSON.stringify(result),
        Subject: 'New Files Added to Catalog',
      }))
      .catch(err => `Some error occured during product snsClient.publish: ${err}`)
    })

    const results = await Promise.all(createProductPromises);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Created', data: JSON.stringify(results) }),
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
