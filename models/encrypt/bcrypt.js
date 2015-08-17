var bcrypt = require('bcrypt');

module.exports = {
    'hash': bcrypt.hash,
    'validate': bcrypt.compare
};