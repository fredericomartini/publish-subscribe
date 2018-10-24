/**
 * Worker responsável por processar fila no REDIS
 */
const Queue = require('bull');
require('dotenv').config({
  path: '../.env'
});
const util = require('util');
const sleep = util.promisify(setTimeout);

/**
 * Env vars
 */
const {
  REDIS_HOST,
  REDIS_PORT,
} = process.env;
const QUEUE_NAME = 'sms';

/**
 * Faz conexão com REDIS e faz SUBSCRIBE em queue
 */
const queue = new Queue(QUEUE_NAME, `redis://${REDIS_HOST}:${REDIS_PORT}`);

queue.process(async (job, jobDone) => {
  // Sleep por 1S
  await sleep(3000);
  console.log(`Enviar ${QUEUE_NAME} do jobID: ${job.id}`);
  // console.log(job.opts);
  if (job.id == 3) {
    console.log('errro');
    // max tentativas, remover job
    // throw new Error('job falhou!');
    jobDone(new Error('job falhou!'));
  }
  jobDone();
});

// queue.process(function (job, jobDone) {
//   handle(job);
//   queue.close();
//   jobDone();
// });


queue.on('progress', function (job, progress) {
  console.log(`Job ${job.id} is ${progress * 100}% ready!`);
});

