#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ImportServiceConstruct } from './constructs/ImportServiceConstruct';
import './config/config';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'ImportServiceStack');

new ImportServiceConstruct(stack, 'import-service');
