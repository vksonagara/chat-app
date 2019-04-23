const Room = require('../models/Room');
const mongoose = require('mongoose');
const User = require('../models/User');

const RoomController = {
    renderRoomPageWithId,
    addUser,
    getUsers,
    removeUser
};

async function renderRoomPageWithId(req, res, next) {
    const { roomId } = req.params;
    try {
        if(!mongoose.Types.ObjectId.isValid(roomId)) {
            return res.status(404).sendFile(`${process.cwd()}/views/404.htm`);
        }
        room = await Room.findOne({ _id: roomId }).exec();
        if(!room) {
            return res.status(404).sendFile(`${process.cwd()}/views/404.htm`);
        }
        let users = await Promise.all(room.connections.map(conn => {
            return User.findById(conn.userId).exec();
        }));

        return res.render('room', { room, users });
    } catch(err) {
        return next(err);
    }
}

function addUser(room, socket) {

    // Get current user's id
    const userId = socket.request.session.passport.user;

    // Push connection to room
    const conn = {
        userId,
        socketId: socket.id
    };
    room.connections.push(conn);
    return room.save();
}

async function getUsers(room, socket) {

    // Get room id and user id
    let users = [], userHashTable = {}, current = 0;
    const userId = socket.request.session.passport.user;

    // Loop over each connections in room to get users
    room.connections.forEach((conn) => {

        // Number of connections of current user(using more than one socket)
        if(conn.userId === userId) {
            current++;
        }

        // Create set of users id(unique users id array)
        if(!userHashTable[conn.userId]) {
            users.push(conn.userId);
        }

        userHashTable[conn.userId] = true;
    });
    
    try {
        users = await Promise.all(users.map(userId => {
            return User.findById(userId).exec();
        }));
        return Promise.resolve({ users, current });
    } catch(err) {
        throw err;
    }
}

async function removeUser(socket) {
    let userId = socket.request.session.passport.user;
    try {
        let rooms = await Room.find({ 'connections.userId': userId }).exec();
        let result = [];
        for(let j=0; j < rooms.length; j++) {
            let room = rooms[j];
            let pass = true, current = 0, target = 0;
            room.connections.forEach((conn, i) => {
                if(conn.userId === userId) {
                    current++;
                } 
                if(conn.socketId === socket.id) {
                    pass = false;
                    target = i;
                }
            });
            if(!pass) {
                room.connections.id(room.connections[target]._id).remove();
                room = await room.save();
                result.push({ room, userId, current });
            }
        }
        return result;

    } catch(err) {
        throw err;
    }
}

module.exports = RoomController;