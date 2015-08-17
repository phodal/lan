var bcrypt = require('bcrypt');

function hash(password, callback) {
    return bcrypt.hash(password, 10, callback);
}

module.exports = {
    'hash': hash,
    'validate': bcrypt.compare
};