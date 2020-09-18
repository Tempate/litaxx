const express = require('express')
const path = require('path')

const app = express()
app.use(express.static(path.join("client")))

const server = require('http').createServer(app)
const port = process.env.PORT || 3000

const io = require('socket.io')(server)

io.on('connection', socket => {
    socket.on('new_game', _ => {
        console.log('New game requested')
    })

    socket.on('join_game', message => {
        console.log('Join game:', message)
    })
})

server.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})
