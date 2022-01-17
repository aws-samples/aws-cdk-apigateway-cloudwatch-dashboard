import * as cdk from '@aws-cdk/core';
import { TransactionsAPI } from './cdk-transactions-api-lambda-construct';
import { ProfileAPI } from './cdk-profile-api-lambda-construct';
import { ApiDashboard, ApiAlarmProps } from './api-dashboard-construct';

export interface ApiDashboardStackProps {
  readonly dashboardName: string;
  readonly alarmsDashboardName: string;
};

const defaultAlarmProps: ApiAlarmProps = {
  evaluationPeriods: 3,
  p50LatencypThreshold: 2000,
  p90LatencypThreshold: 3000,
  p99LatencypThreshold: 5000,
  erro4xxThreshold: 5,
  error5xxThreshold: 5,
  enable: true,
};

export class ApiDashboardStack extends cdk.Stack {

  constructor(scope: cdk.App, id: string, props: ApiDashboardStackProps) {
    super(scope, id);

    const transactionApiName = "TransactionsApi";
    new TransactionsAPI(this, transactionApiName);

    const profileApiName = "ProfileApi";
    new ProfileAPI(this, profileApiName);

    const apiDashboard = new ApiDashboard(this, "ApiDashboard", {
      dashboardName: props.dashboardName,
      alarmsDashboardName: props.alarmsDashboardName,
      metricPeriodInMinutes: 5,
    });

    // add Profiles API
    apiDashboard.addApi({
      apiName: profileApiName,
      apiStage: "prod",
      displayName: "Profile API"
    });

    // add Transactions API with operations and alarms
    apiDashboard.addApi({
      apiName: transactionApiName,
      apiStage: "prod",
      displayName: "Transactions API",
      alarmProps: defaultAlarmProps,
      operations: [
        {
          displayName: "BeginTransaction",
          resource: "/transactions",
          method: "POST",
          alarmProps: defaultAlarmProps
        },
        {
          displayName: "GetTransaction",
          resource: "/transactions/{transaction_id}",
          method: "GET",
          alarmProps: defaultAlarmProps
        },
        {
          displayName: "UpdateTransaction",
          resource: "/transactions/{transaction_id}",
          method: "PUT",
          alarmProps: defaultAlarmProps
        },
      ]
    });
  }

}