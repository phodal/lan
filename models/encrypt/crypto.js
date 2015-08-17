var crypto = require('crypto');

var SaltLength = 9;

function createHash(password, callback) {
    var salt = generateSalt(SaltLength);
    var hash = md5(password + salt);
    callback(null, salt + hash);
}

function validateHash(password, hash , callback) {
    var salt = hash.substr(0, SaltLength);
    var validHash = salt + md5(password + salt);
    callback(null , hash === validHash);
}

function generateSalt(len) {
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ',
        setLen = set.length,
        salt = '';
    for (var i = 0; i < len; i++) {
        var p = Math.floor(Math.random() * setLen);
        salt += set[p];
    }
    return salt;
}

function md5(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}

module.exports = {
    'hash': createHash,
    'validate': validateHash
};