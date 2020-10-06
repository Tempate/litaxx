
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

                if (indexHistory >= 2) {
                    moveHistory[indexHistory - 2].map(unmarkSquare);
                }

                if (indexHistory >= 1) {
                    moveHistory[indexHistory - 1].map(markSquare);
                }
            }

            break;
        case 'ArrowLeft':
            if (indexHistory > 0) {
                fenToHtmlBoard(boardHistory[--indexHistory]);

                moveHistory[indexHistory].map(unmarkSquare);

                if (indexHistory >= 1) {
                    moveHistory[indexHistory - 1].map(markSquare);
                }
            }

            break;
    }
});

function resign() {
    socket.emit('resign');
}
