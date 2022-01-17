import * as cdk from '@aws-cdk/core';
import { Dashboard, GraphWidget, Metric, TextWidget, Alarm, AlarmWidget } from '@aws-cdk/aws-cloudwatch';

export interface ApiDashboardProps {
  readonly dashboardName: string;
  readonly alarmsDashboardName: string;
  readonly metricPeriodInMinutes?: number;
};

export interface ApiAlarmProps {
  readonly evaluationPeriods: number,
  readonly datapointsToAlarm?: number,
  readonly p50LatencypThreshold: number;
  readonly p90LatencypThreshold: number;
  readonly p99LatencypThreshold: number;
  readonly erro4xxThreshold: number;
  readonly error5xxThreshold: number;
  readonly enable: boolean,
};

// Monitoring dashboard interfaces
export interface ApiProps {
  readonly apiName: string;
  readonly apiStage: string;
  readonly displayName: string;
  readonly alarmProps?: ApiAlarmProps;
  readonly operations?: ApiOperationProps[];
};

export interface ApiOperationProps {
  readonly resource: string,
  readonly method: string,
  readonly displayName: string;
  readonly alarmProps?: ApiAlarmProps;
};

export class ApiDashboard extends cdk.Construct {

  protected apiDashboard: Dashboard;
  protected apiAlarmsDashboard: Dashboard;
  protected readonly metricPeriod: number;

  protected readonly calls: Metric;
  protected readonly latency: Metric;
  protected readonly integrationLatency: Metric;
  protected readonly error4xx: Metric;
  protected readonly error5xx: Metric;

  constructor(scope: cdk.Construct, id: string, props: ApiDashboardProps) {
    super(scope, id);

    this.metricPeriod = props.metricPeriodInMinutes ?? 5; // default 5 minutes
    const period = cdk.Duration.minutes(this.metricPeriod);

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

    this.apiDashboard = new Dashboard(scope, props.dashboardName, {
      dashboardName: props.dashboardName
    });

    this.apiAlarmsDashboard = new Dashboard(scope, props.alarmsDashboardName, {
      dashboardName: props.alarmsDashboardName
    });
  }

  // Monitoring dashboard
  public addApi(props: ApiProps) {

    const dimensions = {
      "ApiName": props.apiName,
      "Stage": props.apiStage
    };

    this.addWidgets(props.displayName, dimensions);

    if (props.alarmProps)
      this.addAlarmWidgets(props.displayName, dimensions, props.alarmProps);

    if (props.operations && props.operations.length > 0) {
      props.operations.forEach(op => {

        const opDimentions = {
          "ApiName": props.apiName,
          "Stage": props.apiStage,
          "Resource": op.resource,
          "Method": op.method,
        };

        this.addWidgets(op.displayName, opDimentions);

        if (op.alarmProps)
          this.addAlarmWidgets(op.displayName, opDimentions, op.alarmProps);
      });
    }
  }

  // add one row
  protected addWidgets(displayName: string, dimensions: any) {

    const transform = (metric: Metric, dimensions: any, statistic?: string): Metric => {
      return metric.with({
        dimensions: dimensions,
        ...(statistic && { statistic: statistic })
      });
    };

    const calls = transform(this.calls, dimensions);
    const latency = transform(this.latency, dimensions, "P50");
    const latencyP99 = transform(this.latency, dimensions, "P99");
    const integrationLatency = transform(this.integrationLatency, dimensions, "P50");
    const integrationLatencyP99 = transform(this.integrationLatency, dimensions, "P99");
    const error4xx = transform(this.error4xx, dimensions);
    const error5xx = transform(this.error5xx, dimensions);

    this.apiDashboard.addWidgets(

      // header
      new TextWidget({
        markdown: `### ${displayName}`,
        height: 1,
        width: 24
      }),

      new GraphWidget({
        title: `${displayName} Calls`,
        left: [calls]
      }),

      new GraphWidget({
        title: `${displayName} Latency`,
        left: [latency, latencyP99]
      }),

      new GraphWidget({
        title: `${displayName} Intg Latency`,
        right: [integrationLatency, integrationLatencyP99]
      }),

      new GraphWidget({
        title: `${displayName} Errors`,
        right: [error4xx, error5xx]
      }),
    );
  }

  // add one row
  protected addAlarmWidgets(displayName: string, dimensions: any, alarmProps: ApiAlarmProps) {

    const transform = (metric: Metric, alarmId: string, displayName: string, threshold: number, alarmProps: ApiAlarmProps, dimensions: any, statistic?: string): Alarm => {
      return metric.with({
        dimensions: dimensions,
        ...(statistic && { statistic: statistic })
      }).createAlarm(this, alarmId, {
        alarmName: displayName,
        evaluationPeriods: alarmProps.evaluationPeriods,
        datapointsToAlarm: alarmProps.datapointsToAlarm,
        threshold: threshold,
        actionsEnabled: alarmProps.enable,
      });
    };

    const p50Alarm = transform(this.latency, `${displayName}-LatencyP50Alarm`, `${displayName} Latency P50`, alarmProps.p50LatencypThreshold, alarmProps, dimensions, "P50");
    const p90Alarm = transform(this.latency, `${displayName}-LatencyP90Alarm`, `${displayName} Latency P90`, alarmProps.p90LatencypThreshold, alarmProps, dimensions, "P90");
    const p99Alarm = transform(this.latency, `${displayName}-LatencyP99Alarm`, `${displayName} Latency P99`, alarmProps.p99LatencypThreshold, alarmProps, dimensions, "P99");

    const error4xxAlarm = transform(this.error4xx, `${displayName}-4XXError`, `${displayName} 4XX Error`, alarmProps.erro4xxThreshold, alarmProps, dimensions);
    const error5xxAlarm = transform(this.error5xx, `${displayName}-5XXError`, `${displayName} 5XX Error`, alarmProps.error5xxThreshold, alarmProps, dimensions);

    this.apiAlarmsDashboard.addWidgets(

      // header
      new TextWidget({
        markdown: `### ${displayName}`,
        height: 1,
        width: 24
      }),

      new AlarmWidget({
        alarm: p50Alarm,
        title: p50Alarm.alarmName,
        width: 5
      }),

      new AlarmWidget({
        alarm: p90Alarm,
        title: p90Alarm.alarmName,
        width: 5
      }),

      new AlarmWidget({
        alarm: p99Alarm,
        title: p99Alarm.alarmName,
        width: 4
      }),

      new AlarmWidget({
        alarm: error4xxAlarm,
        title: error4xxAlarm.alarmName,
        width: 5
      }),

      new AlarmWidget({
        alarm: error5xxAlarm,
        title: error5xxAlarm.alarmName,
        width: 5
      }),
    );
  }
}
