#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AuthServiceConstruct } from './constructs/AuthServiceConstruct';
import './config/config';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'AuthServiceStack');

new AuthServiceConstruct(stack, 'AuthServiceConstruct');
