'use strict'

var express = require('express');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var users = [];
var connections = [];
const port = process.env.PORT || 3000;

server.listen(port, function () {
    console.log('Magic at port ' + port);
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/static/index.html')
});

io.sockets.on('connection', function (socket) {

    var updateUsers = function () {
        io.sockets.emit('udpdate-user-list', { users: users });
    };

    connections.push(socket);
    console.log('connected: %s sockets connected', connections.length);

    //Send username
    socket.on('new-user', function (userName, callback) {
        if (userName === '') return;
        
        socket.userName = userName;
        users.push(userName);        

        io.sockets.emit('new-message', { msg: '<strong>' + socket.userName + '</strong> just entered the room.' });                
        callback(true);
        updateUsers();                
    });

    //Disconnect
    socket.on('disconnect', function (data) {
        users.splice(users.indexOf(socket.userName), 1);
        connections.splice(connections.indexOf(socket), 1);
        updateUsers();
        console.log('Disconnected: %s sockets connected', connections.length);
        io.sockets.emit('new-message', { msg: '<strong>' + socket.userName + '</strong> left the room.' });                
    });

    //Send message
    socket.on('send-message', function (data) {
        io.sockets.emit('new-message', { msg: '<strong>' + socket.userName + '</strong> says: ' + data });
    });
});

