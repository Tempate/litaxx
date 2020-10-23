/*  This file is part of Litaxx.

    Litaxx is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Litaxx is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Litaxx. If not, see <https://www.gnu.org/licenses/>.
*/

// External requirements
const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')

// Internal requirements
const createRoom = require('./server/room')

const app = express()
app.set('views', 'client')
app.set('view engine', 'ejs')
app.use(express.static('client'));

const server = http.createServer(app)
const port = process.env.PORT || 3000

let users = new Map();
let rooms = new Map();

exports.users = users
exports.rooms = rooms

const io = socketio(server)

app.get('/', (req, res) => {
    res.render('index', {"rooms": rooms});
})

app.get('/game', (req, res) => {
    const gameId = req.query.gameId;

    if (!gameId) {
        // If the gameId was not sent, create a new room and
        // redirect the user to it.

        const room = createRoom(io);
        rooms.set(room.code, room);

        res.redirect('/game?gameId=' + room.code);

    } else if (!(/^[A-Z]{4}$/.test(gameId))) {
        res.send("Room code is not valid")
    } else if (!rooms.get(gameId)) {
        res.send("Room doesn't exist");
    } else {
        res.render('mode-online');
    }
})

app.get('/computer', (req, res) => {
    res.render('mode-computer');
})

io.on('connection', socket => {
    socket.on('join_lobby', _ => {
        socket.join("lobby");
    })

    socket.on('join_game', code => {
        let room = rooms.get(code)

        if (!room) {
            socket.emit("room_doesnt_exist", 0);
        } else if (users.get(socket.id) != code) {
            users.set(socket.id, room.code);
            room.join(socket);
        }
    })

    socket.on('move', move => {
        const room = getRoom(socket.id);

        if (room) {
            room.makeMove(move, socket.id);
        }
    })

    // FENs are a way to compress the board's state into a string
    // https://www.chessprogramming.org/Forsyth-Edwards_Notation
    socket.on('fen', fen => {
        const room = getRoom(socket.id);

        if (room) {
            room.setFen(fen);
        }
    })

    socket.on('offer_draw', _ => {
        const room = getRoom(socket.id);

        if (room) {
            room.offerDraw(socket.id);
        }
    })

    socket.on('resign', _ => {
        const room = getRoom(socket.id);

        if (room) {
            room.resign(socket.id);
        }
    })

    socket.on('disconnect', _ => {
        const room = getRoom(socket.id);

        if (socket.id in users) {
            users.delete(socket.id);
        }

        if (room) {
            room.leave(socket);
        }
    })
})

server.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})

function getRoom(id) {
    const code = users.get(id);
    return rooms.get(code);
}
