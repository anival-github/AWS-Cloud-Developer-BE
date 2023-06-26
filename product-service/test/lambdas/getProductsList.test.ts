import { products } from '../../src/resources/data';
import { handler } from '../../src/lambdas/getProductsList';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('Get product list handler test', () => {
  it('Return list of products', async () => {
    const result = await handler(
      {
        path: 'path',
        body: JSON.stringify({}),
      } as APIGatewayProxyEvent
    );

    expect(result).toEqual({
      statusCode: 200,
      headers: {},
      body: JSON.stringify(products),
    });
  });
});
