import AWS from 'aws-sdk';
import crypto from 'crypto';
import { CreateProduct } from '../types/createProductType';

const dynamo = new AWS.DynamoDB.DocumentClient();

export const createProduct: CreateProduct = async ({
  price,
  title,
  description,
  count,
}) => {
  try {
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
      message: 'Product created',
      productId: uid,
    }
  } catch (error) {
    throw new Error(`Error during product creation: ${error}`);
  }
}