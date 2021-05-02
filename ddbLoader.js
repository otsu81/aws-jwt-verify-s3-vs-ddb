const aws = require('aws-sdk');
const fs = require('fs');
const { result } = require('lodash');
const _ = require('lodash');

const timer = ms => new Promise( res => setTimeout(res, ms));

function makeBatches (publicKeysDir, batchSize) {
    const publicKeys = fs.readdirSync(publicKeysDir);
    const batches = _.chunk(publicKeys, batchSize);

    const ddbBatch = [];
    batches.forEach(batch => {
        let items = [];
        batch.forEach(keyName => {
            items.push({
                keyName: keyName,
                key: fs.readFileSync(publicKeysDir.concat(keyName)).toString()
            })
        });
        ddbBatch.push(items);
    });
    return ddbBatch;
};

async function resolvePromises(promises) {
    unprocessed = [];
    console.log('awaiting batch promise resolution');
    let ts1 = new Date().getTime();
    let result = await Promise.all(promises);
    let ts2 = new Date().getTime();
    result.forEach(item => {
        if (Object.keys(item.UnprocessedItems).length !== 0) {
            console.log(item);
            unprocessed.push(item);
        };
    });
    await timer(ts2 - ts1 + 50);
    return unprocessed;
}

async function ddbBatchWriter (batches, ddbTablename, awsRegion) {
    aws.config.update({
        region: awsRegion
    });
    const ddb = new aws.DynamoDB.DocumentClient();

    let promises = [];
    let unprocessed = [];
    for (j = 0; j < batches.length; j++) {

        // limit to DDB is 50 calls per second, with some headroom...
        if (promises.length >= 48) {
            unprocessed.concat(await resolvePromises(promises));
            promises = [];
        }

        let batch = batches[j];
        let itemsArray = [];
        for (i = 0; i < batch.length; i++) {
            itemsArray.push({
                PutRequest: {
                    Item: batch[i]
                }
            })
        };
        let params = {
            RequestItems: {
                [ddbTablename]: itemsArray
            }
        };
        promises.push(ddb.batchWrite(params).promise());
    }
    unprocessed.concat(await resolvePromises(promises));
    return unprocessed;
};

async function run(ddbTablename, awsRegion) {
    const batches = makeBatches('public_keys/', 25); // max batch size is 25 requests, 400kb per item, 16MB total
    await ddbBatchWriter(batches, ddbTablename, awsRegion);

}

if (!(process.argv[2] && process.argv[3])) console.log('Must specify DDB table name and region, example usage: node ddbLoader dynamo-table eu-west-1')
else run(process.argv[2], process.argv[3]);