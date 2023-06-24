import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './import-service.importProductsFile';
import { createPresignedUrlWithClient } from './createPresignedUrlWithClient';

jest.mock('./createPresignedUrlWithClient', () => ({
  createPresignedUrlWithClient: jest.fn(),
}));

describe('importProductsFile lambda handler test', () => {
  it('Return product by id', async () => {
    process.env.BUCKET_NAME = '345';

    (createPresignedUrlWithClient as jest.Mock).mockResolvedValueOnce('URL');

    const result = await handler({
      queryStringParameters: { name: '123' },
    } as unknown as APIGatewayProxyEvent);

    expect(createPresignedUrlWithClient).toHaveBeenCalledWith(
      expect.objectContaining({
        region: 'us-east-1',
        bucket: '345',
        key: 'uploaded/123',
      })
    );

    expect(result).toEqual({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      body: JSON.stringify({ signedURL: 'URL' }),
    });
  });
});
