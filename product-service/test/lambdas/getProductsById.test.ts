import { APIGatewayProxyEvent } from 'aws-lambda';
import { products } from '../../src/resources/data';
import { handler } from '../../src/lambdas/getProductsById';

describe('Get product by id test', () => {
  it('Return product by id', async () => {
    const id = '7567ec4b-b10c-48c5-9345-fc73c48a80aa';
    const mockEvent = { path: `/products/${id}` } as APIGatewayProxyEvent;

    const expectedProduct = products.find(item => item.id === id);
    const result = await handler(mockEvent);

    expect(result).toEqual({
      statusCode: 200,
      headers: {},
      body: JSON.stringify(expectedProduct),
    });
  });

  it('Product not found', async () => {
    const id = '123';
    const mockEvent = { path: `/products/${id}` } as APIGatewayProxyEvent;
    const result = await handler(mockEvent);

    expect(result).toEqual({
      statusCode: 204,
      headers: {},
      body: 'Product not found',
    });
  });
});
