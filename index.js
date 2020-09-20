const express = require('express')
const path = require('path')

const app = express()
app.use(express.static(path.join("client")))

const server = require('http').createServer(app)
const port = process.env.PORT || 3000

const io = require('socket.io')(server)

let players = {}
let games = {}

io.on('connection', socket => {
    socket.on('new_game', _ => {
        const game_code = gen_game_code()
        join_game(socket, game_code)
    })

    socket.on('join_game', game_code => {
        join_game(socket, game_code)
    })

    socket.on('played_move', move => {
        socket.to(players[socket.id]).emit("played_move", move)
    })
})

server.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})

function join_game(socket, game_code) {
    console.log('Joining game:', game_code)

    const color = assign_color(socket.id, game_code)
    players[socket.id] = game_code

    socket.join(game_code)

    io.to(game_code).emit("game_code", game_code)
    io.to(socket.id).emit("color", color)
}

function assign_color(player, game_code) {
    let color

    if (game_code in games) {
        games[game_code]["users"] += 1

        if (games[game_code]["users"] != 2)
            return

        color = ("black" in games[game_code]) ? "white" : "black"
    } else {
        games[game_code] = {"users": 1}
        color = random_color()
    }

    games[game_code][color] = player

    return color
}

function gen_game_code() {
    let code = ""

    for (let i = 0; i < 4; i++)
        code += String.fromCharCode("A".charCodeAt(0) + Number(Math.random() * 26))

    return code
}

function random_color() {
    return (Math.random() > 0.5) ? "black" : "white"
}
