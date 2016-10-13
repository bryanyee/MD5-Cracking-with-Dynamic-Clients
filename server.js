const express = require('express');
const path = require('path');
const app = express(); 
const http = require('http').Server(app); 

const workerArr = [];
let globalStartTime;

const tireHash = '7ae77998b722d658ee672c2b288a4c96';
const length = 4;

function startClient(hash, length, socket) {
  globalStartTime = Date.now();
  console.log("GLOBAL STARTTIME", globalStartTime);
	const numCombos = Math.pow(26, length);
	const begin = 0;
	const end = numCombos - 1; 
 	socket.emit('doCrack', {hash, length, begin, end, globalStartTime})
}

let io = require('socket.io')(http);
//socket io cant handle an express server?

app.use(express.static(__dirname));

io.on('connection', function(socket) {
	console.log("a user connected with the following id: ", socket.id);
	socket.on('requestWork', function() {
		startClient(tireHash, length, socket);
	});
	socket.on('crackedPassword', function(data) {
		console.log(`We've found the password: ${data.password} in ${data.duration}`);
	})
})

//io emit -> emit message to every connected socket  
//socket emit ->  emit message to self 
//socket.broadcast.emit -> emit message to every socket except self 

http.listen(3000, function() {
	console.log("currently listening");
})