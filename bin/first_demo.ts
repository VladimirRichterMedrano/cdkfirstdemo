#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FirstDemoStack } from '../lib/first_demo-stack';

const app = new cdk.App();
new FirstDemoStack(app, 'FirstDemoStack', {
    env: {
        region: 'us-east-1',
        account: '392405208147',
    },
});
