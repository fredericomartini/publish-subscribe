/**
 * Worker responsável por processar fila no REDIS
 */
const Queue = require('bull');
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
const QUEUE_NAME = 'push';

/**
 * Faz conexão com REDIS e faz SUBSCRIBE em queue
 */
const queue = new Queue(QUEUE_NAME, `redis://${REDIS_HOST}:${REDIS_PORT}`);

queue.process((job) => {
  console.log(`Enviar ${QUEUE_NAME} do jobID: ${job.id}`);
});
