const User = require('../models/User');

const UserController = {
    getUserWithId,
    handleCreateNewUser,
    publicUserInfo
};

async function getUserWithId(req, res) {
    return res.send('Hello');
}

async function handleCreateNewUser(req, res) {
    const { username, password } = req.body;
    if(username !== '' && password !== '') {
        const user = new User({
            username,
            password
        });
        try {
            await user.save();
            req.login(user, (err) => {
                return res.redirect('/rooms');
            });
        } catch(err) {
            console.log(err);
            req.flash('error_message', 'Username is already taken');
            res.redirect('/signup');
        }
    }
    else {
        req.flash('error_message', 'Username or password is empty');
        res.redirect('/signup');
    }
}

function publicUserInfo(user) {
    return {
        username: user.username,
        _id: user._id
    };
}

module.exports = UserController;