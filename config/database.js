const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/chat-app', { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);

module.exports = mongoose.connection;