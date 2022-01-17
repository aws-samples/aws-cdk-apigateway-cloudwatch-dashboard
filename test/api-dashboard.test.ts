import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { ApiDashboardStack } from '../lib/api-dashboard-stack';

test('API Dashboard Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new ApiDashboardStack(app, 'DemoAppApiDashboardStack', {
    dashboardName: "DemoAppDashboard",
    alarmsDashboardName: 'DemoAppAlarmsDashboard',
  });
  // THEN
  expectCDK(stack).to(haveResource("AWS::CloudWatch::Dashboard", {
    DashboardName: "DemoAppDashboard"
  }));
  expectCDK(stack).to(haveResource("AWS::CloudWatch::Dashboard", {
    DashboardName: "DemoAppAlarmsDashboard"
  }));
});

