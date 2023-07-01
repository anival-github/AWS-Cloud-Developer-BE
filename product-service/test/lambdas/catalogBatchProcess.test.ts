import { APIGatewayProxyEvent } from 'aws-lambda';
import { products } from '../../src/resources/data';
import { handler } from '../../src/lambdas/catalogBatchProcess';
import { createProduct } from '../../src/dynamoDb/createProduct';
import { snsClient } from '../../src/utils/snsClient';
import { ProductDataSchema } from '../../src/schemas/createProductDto';

jest.mock('../../src/dynamoDb/createProduct', () => ({
  createProduct: jest.fn(),
}))

jest.mock('../../src/utils/snsClient', () => ({
  snsClient: {
    publish: jest.fn()
  },
}))

describe('Test catalogBatchProcess handler', () => {
  it('catalogBatchProcess handler works correctly', async () => {
    process.env.IMPORT_PRODUCTS_TOPIC_ARN = "testARN";
    const productData = {title: 'title', count: 1, description: 'descriptoion', price: 100};
    const spy = jest.spyOn(ProductDataSchema, 'validate');

    const event: any = {
      Records: [
        {
          body: JSON.stringify(productData),
        }
      ],
    };

    (createProduct as jest.Mock).mockResolvedValue({id: 123, message: 'created' });
    (snsClient.publish as jest.Mock).mockResolvedValue('success');

    const expected = {
      statusCode: 200,
      body: JSON.stringify({ message: 'Created', data: JSON.stringify([productData]) }),
    }

    const result = await handler(event);

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(productData);

    expect(createProduct).toBeCalledTimes(1);
    expect(createProduct).toBeCalledWith(productData);

    expect(snsClient.publish).toBeCalledTimes(1);
    expect(snsClient.publish).toBeCalledWith({
      TopicArn: process.env.IMPORT_PRODUCTS_TOPIC_ARN,
      Message: JSON.stringify({id: 123, message: 'created' }),
      Subject: 'New Files Added to Catalog',
    });

    expect(result).toEqual(expected);
  });
});
