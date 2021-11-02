import * as cdk from '@aws-cdk/core';
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";

export class ProfileAPI extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        const addProfileHandler = new lambda.Function(this, "AddProfile", {
            functionName: "AddProfile",
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset("src/profile"),
            handler: "AddProfile.handler",
        });

        const updateProfileHandler = new lambda.Function(this, "UpdateProfile", {
            functionName: "UpdateProfile",
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset("src/profile"),
            handler: "UpdateProfile.handler",
        });

        const getProfileHandler = new lambda.Function(this, "GetProfile", {
            functionName: "GetProfile",
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset("src/profile"),
            handler: "GetProfile.handler",
        });

        const profileApi = new apigateway.RestApi(this, id, {
            restApiName: id,
            description: "Manage Profile API"
        });

        const profile = profileApi.root.addResource("profile")
        const profileAGW = profile.addResource("{profile_id}")

        const getProfileIntegration = new apigateway.LambdaIntegration(getProfileHandler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });
        profileAGW.addMethod("GET", getProfileIntegration);

        const addProfileIntegration = new apigateway.LambdaIntegration(addProfileHandler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });
        profileAGW.addMethod("POST", addProfileIntegration);

        const updateProfileIntegration = new apigateway.LambdaIntegration(updateProfileHandler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });
        profileAGW.addMethod("PUT", updateProfileIntegration);
    }
}