console.log("Hello world");

let express = require('express');
let app = express();
let server = app.listen(3000, listening);

function listening() {
    console.log("Listening...");
}

app.use(express.static('public'));