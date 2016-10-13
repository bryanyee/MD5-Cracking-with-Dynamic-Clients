//start connection and work when use clicks button
const workerArr = [];
let globalStartTime;

$('#start').on('click', function() {
	let socket = io();

	socket.on('connect_error', function(err) {
		console.log("You are receiving an error: ", err);
	});

	socket.on('connect', function() {
		socket.emit('requestWork', {cores: navigator.hardwareConcurrency})
		console.log("I AM CONNECTED!!!!");
	});
	
	socket.on('doCrack', function(data) {
		startWorkers(data.hash, data.length, data.begin, data.end, data.globalStartTime, socket); 
	})


})

function startWorkers(hash, length, begin, end, startTime, socket) {
  globalStartTime = startTime;
  const numCombos = end - begin + 1;
  const numWorkers = 3;
  const workerFrag = Math.round(numCombos / numWorkers);
  for (let i = 0; i < numWorkers; i += 1) {
    const workerBegin = begin + (workerFrag * i);
    const workerEnd = workerBegin + (workerFrag - 1);
    const id = i;
    console.log('Id: ', id, 'workerBegin: ', workerBegin, 'workerEnd :', workerEnd);
    const worker = new Worker('worker.js');
    workerArr.push(worker);
    worker.onmessage = handleMessage.bind(null, socket);
    worker.postMessage({ cmd: 'start', hash, id, workerBegin, workerEnd, length});
  }
}

function handleMessage(socket, e) {
  if (e.data.cmd === 'success') {
    const duration = Math.round((Date.now() - globalStartTime) / 1000);
    console.log(`Worker: ${e.data.id} found word: ${e.data.clearText} in ${duration} seconds`);
    workerArr.forEach((worker) => {
      worker.terminate();
    });
    socket.emit('crackedPassword', {duration, password: e.data.clearText});
  }
}