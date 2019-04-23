/**
 * Application dependencies
 */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');


/**
 * Application components
 */
const passport = require('./passport');
const db = require('./config/database');
const router = require('./routes');
const session = require('./session');
const ioServer = require('./socket')(app);

/**
 * Set view engine
 */
app.set('view engine', 'ejs');

/**
 * Application middlewares
 */
app.use(cookieParser('secret'));
app.use(session);
app.use(flash());
app.use('/assets', express.static('assets'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());


/**
 * Middleware to flash error and success messages
 */
app.use((req, res, next) => {
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    if(res.locals.error_message.length === 0) {
        res.locals.error_message = req.flash('error');
    }
    res.locals.user = req.user || null;
    next();
});


/**
 * Set router for the application
 */
app.use('/', router);

/**
 * Middleware to catch 404 errors
 */
app.use(function(req, res, next) {
    res.status(404).sendFile(process.cwd() + '/views/404.htm');
});

/**
 * Server error handler
 */
app.use((err, req, res, next) => {
    res.send(err);
});

/**
 * Start http server and check if database connection is established
 */
// app.listen(3000, () => { console.log('Listening on port 3000'); });
ioServer.listen(3000);
db.once('open', () => console.log('Connected to database'));
db.on('error', (err) => console.log(err));