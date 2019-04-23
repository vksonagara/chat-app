const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

/**
 * LocalStrategy using username and password to authenticate
 */
const strategy = new LocalStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
        if(err) {
            return done(err);
        }
        if(!user) {
            return done(null, false, {message: 'Incorrect username'});
        }
        if(!bcrypt.compareSync(password, user.password)) {
            return done(null, false, {message: 'Incorrect password'});
        }
        return done(null, user);
    });
});

/**
 * Encapsulates all code for authentication
 */
const init = function() {
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            if(err) {
                return done(err);
            }
            return done(null, user);
        });
    });

    passport.use(strategy);

    return passport;
}

module.exports = init();