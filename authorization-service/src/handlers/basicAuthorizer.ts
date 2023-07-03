import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from 'aws-lambda';

const generatePolicy = function(principalId: string, effect: string, resource: string): APIGatewayAuthorizerResult {
  const authResponse = {
    principalId,
  } as APIGatewayAuthorizerResult;

  if (effect && resource) {
      authResponse.policyDocument = {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: resource,
          }
        ],
      };
  }

  authResponse.context = {
      "stringKey": "stringval",
      "numberKey": 123,
      "booleanKey": true
  };

  return authResponse;
}

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult | string> => {
  const {
    PASSWORD_KEY,
    TEST_PASSWORD,
  } = process.env;

  const tokenString = event.authorizationToken;

  if (!tokenString) {
    return 'Unauthorized';
  }

  const token = tokenString.replace('Basic ', '');
  let decoded;

  try {
    decoded = atob(token);
  } catch (error) {
    return generatePolicy('user', 'Deny', event.methodArn);
  }

  try {
    const [key, value] = decoded.split(':');
    const isTokenCorrect = PASSWORD_KEY === key && TEST_PASSWORD === value;

    if (!isTokenCorrect) {
      return generatePolicy('user', 'Deny', event.methodArn);
    }

    if (isTokenCorrect) {
      return generatePolicy('user', 'Allow', event.methodArn);
    }

    return "Error";
  } catch (error) {
    return "Error";
  }
};
