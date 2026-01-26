let io;

module.exports = {
    init: (httpServer) => {
        io = require('socket.io')(httpServer, {
            cors: {
                origin: "*", // Allow all origins for simplicity (or restrict to frontend URL)
                methods: ["GET", "POST"]
            }
        });

        io.on('connection', (socket) => {
            console.log('[Socket] Client connected:', socket.id);

            socket.on('disconnect', () => {
                console.log('[Socket] Client disconnected:', socket.id);
            });

            // Allow clients to join rooms if needed
            socket.on('join_room', (room) => {
                socket.join(room);
                console.log(`[Socket] Client ${socket.id} joined room ${room}`);
            });
        });

        return io;
    },

    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    },

    emit: (event, data) => {
        if (io) {
            io.emit(event, data);
            // console.log(`[Socket] Emitted ${event}`); 
        }
    }
};
