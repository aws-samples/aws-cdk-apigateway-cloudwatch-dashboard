#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { ApiDashboardStack } from '../lib/api-dashboard-stack';

const app = new cdk.App();

// create ApiDashboardStack
const apiDashboardStack = new ApiDashboardStack(app, 'DemoAppApiDashboardStack', {
    dashboardName: 'DemoAppDashboard',
    alarmsDashboardName: 'DemoAppAlarmsDashboard',
});

