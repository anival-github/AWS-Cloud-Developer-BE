import { Stack, StackProps, App, } from 'aws-cdk-lib';
import { ProductService } from './product-service';

export class ProductServiceStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    new ProductService(this, 'Products');
  }
}
