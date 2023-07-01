import { Stack, StackProps, App, } from 'aws-cdk-lib';
import { ProductServiceConstruct } from '../constructs/ProductServiceConstruct';

export class ProductServiceStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    new ProductServiceConstruct(this, 'ProductServiceConstruct');
  }
}
