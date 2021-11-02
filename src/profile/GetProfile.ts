import { APIGatewayProxyEvent } from "aws-lambda";

exports.handler = async function (event: APIGatewayProxyEvent) {
    var method = event.httpMethod;

    if (method === "GET") {
        return {
            statusCode: 200,
            headers: {},
            body: JSON.stringify({id: Math.floor(Math.random()).toString()})
        };
    }

    return {
        statusCode: 400,
        headers: {},
        body: "Bad Request - Only GET is allowed"
    };
}
