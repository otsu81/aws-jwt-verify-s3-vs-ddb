const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const jwt = require('jsonwebtoken');

exports.lambdaHandler = async (event, context) => {
    const params = {
        TableName: `${process.env.TABLE}`,
        Key: {
            'keyName': {
                S: `${event.key}.pub`
            }
        }
    };
    const command = new GetItemCommand(params);

    try {
        const ddb = new DynamoDBClient({region: `${process.env.REGION}`});
        const publicKey = await ddb.send(command);
        const verifiedToken = jwt.decode(event.token, publicKey.Item.key.S, true, 'RS256');
        // console.log(verifiedToken);
        return JSON.stringify({'response':verifiedToken});
    } catch (err) {
        throw(err);
    };
};r