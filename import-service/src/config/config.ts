import dotenv from 'dotenv';

dotenv.config();

const getConfig = () => {
  const BUCKET_NAME = process.env.BUCKET_NAME as string;
  const CATALOG_ITEMS_QUEUE_ARN = process.env.CATALOG_ITEMS_QUEUE_ARN as string;

  if ([BUCKET_NAME, CATALOG_ITEMS_QUEUE_ARN].some(item => !item)) {
    throw new Error('Env var not provided');
  }

  return {
    BUCKET_NAME,
    CATALOG_ITEMS_QUEUE_ARN,
  };
}

const config = getConfig();

export default config;
