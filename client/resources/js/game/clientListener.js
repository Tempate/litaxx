
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
                    const previousMove = moveHistory[indexHistory - 2];
                    unmarkSquare(previousMove[0]);
                    unmarkSquare(previousMove[1]);
                }

                if (indexHistory >= 1) {
                    const currentMove = moveHistory[indexHistory - 1];
                    markSquare(currentMove[0]);
                    markSquare(currentMove[1]);
                }
            }

            break;
        case 'ArrowLeft':
            if (indexHistory > 0) {
                fenToHtmlBoard(boardHistory[--indexHistory]);

                const previousMove = moveHistory[indexHistory];
                unmarkSquare(previousMove[0]);
                unmarkSquare(previousMove[1]);

                if (indexHistory >= 1) {
                    const currentMove = moveHistory[indexHistory - 1];
                    markSquare(currentMove[0]);
                    markSquare(currentMove[1]);
                }
            }

            break;
    }
});

function resign() {
    socket.emit('resign');
}
