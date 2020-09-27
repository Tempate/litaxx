// External requirements
const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')

// Internal requirements
const createRoom = require('./server/room.js')


const app = express()
app.set('views', 'client')
app.set('view engine', 'ejs')
app.use(express.static('client'));

app.get('/', (req, res)=>{ 
    res.render('index'); 
})

const server = http.createServer(app)
const port = process.env.PORT || 3000

const io = socketio(server)

let users = new Map()
let rooms = new Map()

io.on('connection', socket => {
    socket.on('new_game', _ => {
        const room = createRoom(io)

        users.set(socket.id, room.code)
        rooms.set(room.code, room)
        room.join(socket)
    })

    socket.on('join_game', code => {
        const room = rooms.get(code)

        if (room && users.get(socket.id) != code) {
            users.set(socket.id, room.code)
            room.join(socket)
        } else {
            socket.emit("room_doesnt_exist", 0)
        }
    })

    socket.on('played_move', move => {
        const code = users.get(socket.id)
        const room = rooms.get(code)

        room.makeMove(move)
    })

    // FENs are a way to compress the board's state into a string 
    // https://www.chessprogramming.org/Forsyth-Edwards_Notation
    socket.on('fen', fen => {
        const code = users.get(socket.id)
        rooms[code].setFen(fen)
    })
})

server.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})

