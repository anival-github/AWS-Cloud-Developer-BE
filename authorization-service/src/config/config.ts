import dotenv from 'dotenv';

dotenv.config();

const getConfig = (): Record<string, string> => {
  const configurationObject = process.env;

  if (Object.values(configurationObject).some(item => item === undefined)) {
    throw new Error('Env var has undefined');    
  }

  const PASSWORD_KEY = process.env.githubAccount as string;
  const TEST_PASSWORD = process.env[PASSWORD_KEY] as string;

  if ([PASSWORD_KEY, TEST_PASSWORD].some(item => item === undefined)) {
    throw new Error('Env var not provided');
  }

  return {
    PASSWORD_KEY,
    TEST_PASSWORD,
  };
}

const config = getConfig();

export default config;
