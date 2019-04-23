const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    connections: [{
        userId: String,
        socketId: String
    }]
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;