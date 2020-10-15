const ServerHandler = require("./serverHandler");


// Disconnect a user from the room when he unloads the page
window.addEventListener('beforeunload', function(_) {
    ServerHandler.socket.emit('disconnect');
});

window.addEventListener('click', function(e) {
    const element = document.elementFromPoint(e.clientX, e.clientY);

    const move = ServerHandler.board.click(element);

    if (move != undefined) {
        ServerHandler.sendMove(move);
    }
})

// Navigate through the move history
window.addEventListener('keydown', function(e) {
    e = e || window.event;
    
    switch (e.key) {
        case 'ArrowLeft':
            ServerHandler.previousMove();
            break;
        case 'ArrowRight':
            ServerHandler.nextMove();
            break;
    }
});

function resign() {
    ServerHandler.socket.emit('resign');
}

function offerDraw() {
    ServerHandler.socket.emit('offer_draw');
}
