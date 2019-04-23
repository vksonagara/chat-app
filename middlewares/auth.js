const auth = {
    isAuthenticated,
    isGuest
};

function isAuthenticated(req, res, next) {
    if(req.user) {
        return next();
    }
    res.redirect('/login');
}

function isGuest(req, res, next) {
    if(req.user) {
        return res.redirect('/rooms');
    }
    return next();
}

module.exports = auth;