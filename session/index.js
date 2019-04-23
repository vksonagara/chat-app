const session = require('express-session');

const init = function() {
    return session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60000000 }
    });
}

module.exports = init();