#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import './config/config';
import { ImportServiceStack } from './stacks/ImportServiceStack';

const app = new App();

new ImportServiceStack(app, 'ImportServiceStack');
