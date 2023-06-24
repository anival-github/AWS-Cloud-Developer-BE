import { products } from '../../resources/data';
import { handler } from '../../resources/getProductsList';

describe('Get product list handler test', () => {
  it('Return list of products', async () => {
    const result = await handler();

    expect(result).toEqual({
      statusCode: 200,
      headers: {},
      body: JSON.stringify(products),
    });
  });
});
