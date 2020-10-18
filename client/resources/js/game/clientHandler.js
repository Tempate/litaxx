const ServerHandler = require("./serverHandler");

const buttons = {
    "resign": document.querySelector("#resign"),
    "draw":   document.querySelector("#draw"),

    "previousMove": document.querySelector("#previous-move"),
    "nextMove": document.querySelector("#next-move")
};

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

buttons.previousMove.addEventListener('click', function(_) {
    ServerHandler.previousMove();
});

buttons.nextMove.addEventListener('click', function(_) {
    ServerHandler.nextMove();
});

buttons.resign.addEventListener('click', function(_) {
    ServerHandler.socket.emit('resign');
});

buttons.draw.addEventListener('click', function(_) {
    ServerHandler.socket.emit('offer_draw');
});
