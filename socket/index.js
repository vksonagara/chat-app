const Room = require('../models/Room');
const RoomController = require('../controllers/RoomController');
const UserController = require('../controllers/UserController');

const init = function(app) {
    
    const server = require('http').Server(app);
    const io = require('socket.io')(server);

    // Allow socket to use session data using socket middleware
    io.use((socket, next) => {
        require('../session')(socket.request, {}, next);
    });

    // Define all events
    ioEvents(io);

    return server;
};

function ioEvents(io) {

    // Room namespace
    io.of('/rooms').on('connection', (socket) => {
        
        // Create a new room
        socket.on('createRoom', (title) => {
            Room.findOne({ title: new RegExp(`^${title}$`, 'i')}).then(room => {
                if(room) {
                    socket.emit('updateRoomsList', { error: 'Room title already exists' });
                } else {
                    return Room.create({ title });
                }
            }).then(newRoom => {
                socket.emit('updateRoomsList', newRoom);
                socket.broadcast.emit('updateRoomsList', newRoom);
            }).catch(err => {
                throw err;
            });
        });
    });

    // Chatroom namespace
    io.of('/chatroom').on('connection', (socket) => {

        // Check for user joining a room
        socket.on('join', async (roomId) => {
            
            try {

                // Check if room exists with given id
                let room = await Room.findById(roomId).exec();
                if(!room) {
                    socket.emit('updateUsersList', { error: `Room doesn't exist`} );
                } else {
                    // Check if user exists in session
                    if(socket.request.session.passport == null) {
                        return;
                    }

                    // Add user to room
                    let newRoom = await RoomController.addUser(room, socket);

                    // Join the room
                    socket.join(newRoom._id);

                    let { users, current } = await RoomController.getUsers(newRoom, socket);
                    users = users.map(user => UserController.publicUserInfo(user));

                    // Return list of all users connected to the room to the current user
                    socket.emit('updateUsersList', users);

                    // Return the current user to other connecting socket in the room
                    // Only if current user wasn't connected already to the current room
                    if(current === 1) {
                        socket.broadcast.to(newRoom._id).emit('updateUsersList', [users[users.length - 1]]);
                    }
                }
            } catch(err) {
                throw err;
            }
        });

        // When user disconnect
        socket.on('disconnect', async () => {
            
            // Check if user exists in the session
			if(socket.request.session.passport == null){
				return;
            }
            
            // Find the room to which user is connected to
            // and remove the current room and socket from this room
            try {

                let result = await RoomController.removeUser(socket);
                
                result.forEach(res => {
                    let { room, userId, current } = res;
                    socket.leave(room._id);
                    if(current === 1) {
                        socket.broadcast.to(room._id).emit('removeUser', userId);
                    }
                });
            } catch(err) {
                throw err;
            }
        });

        // When new message is received on chat room
        socket.on('newMessage', (msg) => {

            // Broadcast message to other users in the chat room
            socket.broadcast.to(msg.roomId).emit('addMessage', msg.text);
        });

    });
};

module.exports = init;

