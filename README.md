# Loading public keys from S3 or DynamoDB - which is faster

* Generate keys with `make_keys.sh` to folders `public_keys/` and `private_keys/`
* Generate a JSON file with signed JWTs using `sign.js`
* Load DynamoDB table with `ddbloader.js`, example usage: `node ddbLoader myTable eu-west-1`
* Sync `public_keys/` to S3 using AWS CLI, e.g. `aws s3 sync public_keys/ s3://my-bucket`
* Deploy `sam/s3-vs-ddb/` using AWS SAM, e.g. `cd sam/s3-vs-ddb/ && sam deploy --guided`
* Generate load to benchmark using `loadtester [function-name]` as provided by SAM


### Example measurement

![Cloudwatch graph](example_measurement.png)