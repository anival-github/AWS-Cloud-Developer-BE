#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
// import dotenv from 'dotenv';
import { ProductServiceStack } from '../lib/product-service-stack';

// dotenv.config()
const app = new cdk.App();
new ProductServiceStack(app, 'ProductServiceStack');
