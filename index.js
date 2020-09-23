// External requirements
const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')

// Internal requirements
const Room = require('./room.js').Room

const app = express()
app.use(express.static(path.join("client")))

const server = http.createServer(app)
const port = process.env.PORT || 3000

const io = socketio(server)


let users = {}
let rooms = {}


io.on('connection', socket => {
    socket.on('new_game', _ => {
        const room = new Room(io)

        users[socket.id] = room.code
        rooms[room.code] = room
        room.join(socket)
    })

    socket.on('join_game', code => {
        const room = rooms[code]

        if (room && users[socket.id] != code) {
            users[socket.id] = room.code
            room.join(socket)
        }
    })

    socket.on('played_move', move => {
        const code = users[socket.id]
        rooms[code].makeMove(move)
    })

    socket.on('fen', fen => {
        const code = users[socket.id]
        rooms[code].setFen(fen)
    })
})

server.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})

