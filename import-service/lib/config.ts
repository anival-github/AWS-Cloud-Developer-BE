import dotenv from 'dotenv';

dotenv.config();

const getConfig = () => {
  const BUCKET_NAME = process.env.BUCKET_NAME;

  if (!BUCKET_NAME) {
    throw new Error('No bucket name provided');
  }

  return {
    BUCKET_NAME
  };
}

const config = getConfig();

export default config;
