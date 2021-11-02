import * as cdk from '@aws-cdk/core';
import { Dashboard, DashboardProps, GraphWidget, Metric, TextWidget } from '@aws-cdk/aws-cloudwatch';
import { Duration } from '@aws-cdk/core';

export interface ApiDetails {
  apiName: string;
  apiStage: string;
  displayName: string;
}

export interface ApiDashboardsStackProps extends cdk.StackProps {
  dashboardName: string;
}

export class ApiDashboardStack extends cdk.Stack {

  protected readonly apiDashboard: Dashboard;
  protected readonly calls: Metric;
  protected readonly latency: Metric;
  protected readonly integrationLatency: Metric;
  protected readonly error4xx: Metric;
  protected readonly error5xx: Metric;

  constructor(scope: cdk.App, id: string, props: ApiDashboardsStackProps) {
    super(scope, id, props);

    this.apiDashboard = new Dashboard(this, props.dashboardName, {
      dashboardName: props.dashboardName
    });

    const period = Duration.minutes(1); // capture metric every minute. default is 5 minutes.

    this.calls = new Metric({
      namespace: "AWS/ApiGateway",
      metricName: "Count",
      period: period,
      statistic: "sum"
    });

    this.latency = new Metric({
      namespace: "AWS/ApiGateway",
      metricName: "Latency",
      period: period,
      statistic: "avg"
    });

    this.integrationLatency = new Metric({
      namespace: "AWS/ApiGateway",
      metricName: "IntegrationLatency",
      period: period,
      statistic: "avg"
    });

    this.error4xx = new Metric({
      namespace: "AWS/ApiGateway",
      metricName: "4XXError",
      period: period,
      statistic: "sum"
    });

    this.error5xx = new Metric({
      namespace: "AWS/ApiGateway",
      metricName: "5XXError",
      period: period,
      statistic: "sum"
    });
  }

  public addApi(api: ApiDetails) {

    const dimensions = {
      "ApiName": api.apiName,
      "Stage": api.apiStage
    };
    
    this.apiDashboard.addWidgets(

      new TextWidget({
        markdown: `### ${api.displayName}`,
        height: 1,
        width: 24
      }),

      new GraphWidget({
        title: api.displayName + " Calls",
        left: [
          this.calls.with({
            dimensions: dimensions
          })
        ]
      }),

      new GraphWidget({
        title: api.displayName + " Latency",
        left: [
          this.latency.with({
            dimensions: dimensions
          }),

          this.latency.with({
            dimensions: dimensions,
            statistic: "P99",
          })
        ]
      }),

      new GraphWidget({
        title: api.displayName + " Intg Latency",
        right: [
          this.integrationLatency.with({
            dimensions: dimensions,
          }),
          this.integrationLatency.with({
            dimensions: dimensions,
            statistic: "P99"
          })
        ]
      }),
      
      new GraphWidget({
        title: api.displayName + " Errors",
        right: [
          this.error4xx.with({
            dimensions:dimensions,
          }),
          this.error5xx.with({
            dimensions: dimensions,
          })
        ]
      }),
    );
  }
}
