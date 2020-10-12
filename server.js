const express = require("express");
const cors = require('cors');
const routes = require('./routes');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());
app.use('/', routes);

module.exports = app;

const port = process.env.PORT || 5000;

const server = app.listen(port, () => console.log(`Server up and running on port ${port}!`));

const io = require('socket.io')({
    pingTimeout: 5000
}).listen(server);

io.sockets.on('connection', socket => {
    console.log("Allo World");
    const machineId = socket.handshake.query.machine_id;
    const qrScanned = socket.handshake.query.qrscanned;

    console.log('machineId', machineId);
    console.log('mobileClient', qrScanned)

    const room = io.sockets.adapter.rooms[`machine ${machineId}`];
    console.log("room", room);
    console.log("num clients connected", room && room.length)

    // if two clients are already connected, don't connect any more clients to the room...
    if (!room || (room && room.length < 2)) {
        socket.join(`machine ${machineId}`, () => {
            console.log("socket rooms", Object.keys(socket.rooms));

            // Do we only want one mobile app to be able to connect to the machine?
            // const connections = Object.keys(room.sockets).length;
            if (qrScanned) {
                // Broadcast that QR has been scanned
                socket.to(`machine ${machineId}`).emit('qrscanned', "QR Code has been scanned. User is using mobile app to connect to machine");
            } 
            // socket.to(`machine ${machineId}`).emit("qrscanned")
        })

        // Or I can have the machine connect to the machine id room.
        // then when mobile connects, i can just connect it to the room, and broadcast to the room
        // I don't need any reading...


        socket.on('disconnect', reason => {
            // console.log('Bye World', reason);
            if (qrScanned) {
                socket.to(`machine ${machineId}`).emit('qrdisconnected', "User has finished checkout flow on app. Resume Tablet application.");
            }
        });
    }
})