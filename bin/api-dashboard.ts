#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { ApiDashboardStack } from '../lib/api-dashboard-stack';
import { TransactionsAPI } from '../lib/cdk-transactions-api-lambda-construct';
import { ProfileAPI } from '../lib/cdk-profile-api-lambda-construct';

const app = new cdk.App();

// create ApiDashboardStack
const apiDashboardStack = new ApiDashboardStack(app, 'DemoAppApiDashboardStack', {
    dashboardName: "DemoAppDashboard"
});

const transactionApiName = "TransactionsApi";
new TransactionsAPI(apiDashboardStack, transactionApiName);

const profileApiName = "ProfileApi";
new ProfileAPI(apiDashboardStack, profileApiName);

// add each API
apiDashboardStack.addApi({
    apiName: transactionApiName,
    apiStage: "prod",
    displayName: "Transactions API"
});

apiDashboardStack.addApi({
    apiName: profileApiName,
    apiStage: "prod",
    displayName: "Profile API"
});

