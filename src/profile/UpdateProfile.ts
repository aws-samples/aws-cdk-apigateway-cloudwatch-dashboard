import { APIGatewayProxyEvent } from "aws-lambda";

exports.handler = async function (event: APIGatewayProxyEvent) {
    var method = event.httpMethod;

    if (method === "PUT") {
        return {
            statusCode: 200,
            headers: {},
            body: event.body
        };
    }

    return {
        statusCode: 400,
        headers: {},
        body: "Bad Request - Only PUT is allowed"
    };
}
