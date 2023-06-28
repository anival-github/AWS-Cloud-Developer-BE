import { SQSEvent } from 'aws-lambda';
import { createProduct } from '../dynamoDb/createProduct';
import { CreateProductDto } from '../types/createProductDto';
import { ProductDataSchema } from '../schemas/createProductDto';
import { snsClient } from '../utils/snsClient';

export const handler = async (
  event: SQSEvent
): Promise<{
  statusCode: number,
  body: string,
}> => {
  try {
    const IMPORT_PRODUCTS_TOPIC_ARN = process.env.IMPORT_PRODUCTS_TOPIC_ARN as string;

    const records = event?.Records || [];

    const productDataToSave: CreateProductDto[] = records.map((record) => JSON.parse(record?.body))

    const createProductPromises = productDataToSave.map((productData) => ProductDataSchema.validate(productData)
      .then((data) => {
        const {
          title,
          description,
          count,
          price,
        } = data;

        return createProduct({
          title,
          description,
          count,
          price,
        }).then(result => snsClient.publish({
            TopicArn: IMPORT_PRODUCTS_TOPIC_ARN,
            Message: JSON.stringify(result),
            Subject: 'New Files Added to Catalog',
          }))
      }))

    await Promise.all(createProductPromises);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Created', data: JSON.stringify(productDataToSave) }),
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
