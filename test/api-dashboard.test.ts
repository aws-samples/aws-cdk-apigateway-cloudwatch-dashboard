import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { ApiDashboardStack } from '../lib/api-dashboard-stack';

test('API Dashboard Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new ApiDashboardStack(app, 'DemoAppApiDashboardStack', {
    dashboardName: "DemoAppDashboard"
  });
  stack.addApi({
    apiName: "myApi",
    apiStage: "v1",
    displayName: "myApi"
  });
  // THEN
  expectCDK(stack).to(haveResource("AWS::CloudWatch::Dashboard", {
    DashboardName: "DemoAppDashboard"
  }));
});

