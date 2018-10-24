/**
 * Worker responsável por processar fila no REDIS
 * Utiliza lib rsmq-worker 
 * projeto: https://github.com/mpneuried/rsmq-worker
 * 
 */
var RSMQWorker = require("rsmq-worker");
require('dotenv').config({
  path: '../.env'
});

/**
 * Env vars
 */
const {
  REDIS_HOST,
  REDIS_PORT,
} = process.env;
const QUEUE_NAME = 'email';

var worker = new RSMQWorker(QUEUE_NAME);

// /**
//  * Faz conexão com REDIS e faz SUBSCRIBE em queue
//  */
// const queue = new Queue(QUEUE_NAME, `redis://${REDIS_HOST}:${REDIS_PORT}`);

// queue.process((job) => {
//   // execute('result-bull.txt', 'execute', job.id)
//   console.log(`Enviar ${QUEUE_NAME} do jobID: ${job.id}`);
//   console.log(job.data);
// });



// Quando tiver msg na fila
worker.on("message", function (msg, next, id) {
  // process your message
  console.log("Message id : " + id);
  console.log(msg);
  next();
});

// optional error listeners
worker.on('error', function (err, msg) {
  console.log("ERROR", err, msg.id);
});
worker.on('exceeded', function (msg) {
  console.log("EXCEEDED", msg.id);
});
worker.on('timeout', function (msg) {
  console.log("TIMEOUT", msg.id, msg.rc);
});

worker.start();
