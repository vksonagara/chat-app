const express = require('express');
const router = express.Router();
const passport = require('passport');

/**
 * Components to be used for routes
 */
const auth = require('../middlewares/auth');
const UserController = require('../controllers/UserController');
const Room = require('../models/Room');
const RoomController = require('../controllers/RoomController');

/**
 * Set routes for different requests
 */
router.get('/', (req, res) => res.render('index'));
router.get('/signup', auth.isGuest, (req, res) => res.render('signup'));
router.get('/login', auth.isGuest, (req, res) => res.render('login'));
router.post('/signup', UserController.handleCreateNewUser);
router.post('/login', passport.authenticate('local', { 
    successRedirect: '/rooms', 
    failureRedirect: '/login', 
    failureFlash: true
}));
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});
router.get('/rooms', auth.isAuthenticated, (req, res) => {
    Room.find({}).exec().then(rooms => {
        res.render('rooms', { rooms });
    }).catch(err => {
        throw err;
    });
});

router.get('/room/:roomId', auth.isAuthenticated, RoomController.renderRoomPageWithId);

module.exports = router;