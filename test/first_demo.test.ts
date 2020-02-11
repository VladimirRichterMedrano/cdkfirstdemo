import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import FirstDemo = require('../lib/first_demo-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new FirstDemo.FirstDemoStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
