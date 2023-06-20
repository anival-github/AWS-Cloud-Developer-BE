#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ImportService } from '../lib/import-service';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'ImportServiceStack');

new ImportService(stack, 'import-service');
