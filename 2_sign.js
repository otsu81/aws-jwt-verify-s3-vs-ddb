const jwt = require('jsonwebtoken');
const fs = require('fs');

const sign  = async function (path, keyName) {
    const secretMessage = 'i am a super secret message';
    const privateKey = fs.readFileSync(path.concat(keyName));
    const token = jwt.sign({
        message: secretMessage
    }, privateKey, { algorithm: 'RS256' });
    return {key: keyName, token: token};
};

const handler = async function (event, context) {
    const privateKeysDir = 'private_keys/';
    const files = fs.readdirSync(privateKeysDir);
    const promises = [];
    files.forEach(keyName => {
        try {
            promises.push(sign(privateKeysDir, keyName));
        } catch (e) {
            throw(e);
        }
    });
    Promise.all(promises).then((values) => {
        const tokens = {
            tokens: values
        };
        fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2), 'utf-8');
    });
};

handler();