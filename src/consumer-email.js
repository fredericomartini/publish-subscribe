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
const QUEUE_NAME = 'email';

/**
 * Faz conexão com REDIS e faz SUBSCRIBE em queue
 */
const queue = new Queue(QUEUE_NAME, `redis://${REDIS_HOST}:${REDIS_PORT}`);
queue.process(async (job, done) => {
  // Sleep por 3S
  await sleep(3000);
  console.log(`Enviar ${QUEUE_NAME} do jobID: ${job.id}`);
  // console.log(job.opts);
  if (job.id == 3) {
    console.log(`Erro no envio do jobID: ${job.id}`);
    done(new Error('job falhou!'));
  }
  done();
});


queue.on('progress', function (job, progress) {
  console.log(`Job ${job.id} is ${progress * 100}% ready!`);
});

