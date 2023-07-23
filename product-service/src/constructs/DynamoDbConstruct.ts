import { Construct } from 'constructs';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';

interface DynamoDbConstructProps {
  PRODUCTS_TABLE_NAME: string;
  STOCKS_TABLE_NAME: string;
}

export class DynamoDbConstruct extends Construct {
  readonly productsTable: Table;
  readonly stocksTable: Table;

  constructor(scope: Construct, id: string, props: DynamoDbConstructProps) {
    super(scope, id);

    const { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME } = props;

    const productsTable = new Table(this, PRODUCTS_TABLE_NAME, {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: PRODUCTS_TABLE_NAME,
    });

    const stocksTable = new Table(this, STOCKS_TABLE_NAME, {
      partitionKey: {
        name: 'product_id',
        type: AttributeType.STRING,
      },
      tableName: STOCKS_TABLE_NAME,
    });

    this.productsTable = productsTable;
    this.stocksTable = stocksTable;
  }
}
