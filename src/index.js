const http = require("http");
const express = require('express');
const bodyParser = require('body-parser');
const socketIo = require("socket.io");
const cors = require('cors');
const { handleJob,getProductLink } = require('./handleJob');

const port = 5000;
const app = express()

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("FromClient", async (event) => {
        if (!event.command) {
            throw new Error('not command in the request')
        }
        console.log('Server got command: ', event.command);
        switch (event.command) {
            case 'search':
                if(event.data.searchString){
                    let productLink = await getProductLink(event.data.searchString)
                    handleJob(productLink,sendToClient);
                }
                break;

            default:
                break;
        }
        console.log('event', event);
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
    const sendToClient = (msg) => {
        console.log("resultSentToClient");
        socket.emit("FromServer", msg);
    }
});


server.listen(port, () => console.log(`Listening on port ${port}`));

// func()
// Checks if URL is valid
function validURL(str) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(str);
}