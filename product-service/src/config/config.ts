import dotenv from 'dotenv';

dotenv.config();

const getConfig = () => {
  const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME as string;
  const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME as string;
  const SNS_BIG_STOCK_EMAIL = process.env.SNS_BIG_STOCK_EMAIL as string;

  if ([PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME, SNS_BIG_STOCK_EMAIL].some((item) => !item)) {
    throw new Error('Some env var not provided provided');
  }

  return {
    PRODUCTS_TABLE_NAME,
    STOCKS_TABLE_NAME,
    SNS_BIG_STOCK_EMAIL,
  };
}

const config = getConfig();

export default config;
