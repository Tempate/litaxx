const express = require('express')
const path = require('path')

const app = express()
app.use(express.static(path.join("client")))

const server = require('http').createServer(app)
const port = process.env.PORT || 3000

const io = require('socket.io')(server)

io.on('connection', socket => {
    socket.on('new_game', _ => {
        const game_code = gen_game_code()
        join_game(socket, game_code)
    })

    socket.on('join_game', game_code => {
        join_game(socket, game_code)
    })
})

server.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})

function gen_game_code() {
    let code = ""

    for (let i = 0; i < 4; i++)
        code += String.fromCharCode("A".charCodeAt(0) + Number(Math.random() * 26))

    return code
}

function join_game(socket, game_code) {
    console.log('Joining game:', game_code)

    socket.join(game_code)
    io.to(game_code).emit("game_code", game_code)
}