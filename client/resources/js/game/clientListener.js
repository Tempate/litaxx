
// Disconnect a user from the room when he unloads the page
window.addEventListener('beforeunload', function(_) {
    socket.emit('disconnect')
});

// Navigate through the move history
window.addEventListener('keydown', function(e) {
    e = e || window.event;
    
    switch (e.key) {
        case 'ArrowRight':
            if (indexHistory < boardHistory.length - 1) {
                fenToHtmlBoard(boardHistory[++indexHistory]);
            }

            break;
        case 'ArrowLeft':
            if (indexHistory > 0) {
                fenToHtmlBoard(boardHistory[--indexHistory]);
            }

            break;
    }
});

function resign() {
    socket.emit('resign');
}
