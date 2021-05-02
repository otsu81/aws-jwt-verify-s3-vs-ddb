const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Readable } = require('stream');
const jwt = require('jsonwebtoken');

exports.lambdaHandler = async (event, context) => {
    const params = {
        Bucket: `${process.env.BUCKET}`,
        Key: `${event.key}.pub`
    }

    try {
        const s3 = new S3Client({region: `${process.env.REGION}`})
        const publicKeyFile = await s3.send(new GetObjectCommand(params));

        let s3FileBuffer = Buffer.from([]);
        if (publicKeyFile.Body instanceof Readable) {
            for await (const chunk of publicKeyFile.Body) {
                s3FileBuffer = Buffer.concat([s3FileBuffer, chunk]);
            }
        } else {
            throw new Error('Unknown object stream type.');
        };
        const verifiedToken = jwt.verify(event.token, s3FileBuffer, { algorithms: 'RS256' });

        // console.log(verifiedToken);
        return verifiedToken;
    } catch (err) {
        console.log(err);
        throw(err);
    };
};