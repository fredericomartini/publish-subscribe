const express = require('express');
const router = express.Router({
  mergeParams: true
});
const util = require('util');
const sleep = util.promisify(setTimeout);
const Queue = require('bull');
require('dotenv').config();

// Env vars
const {
  REDIS_HOST,
  REDIS_PORT,
} = process.env;
const QUEUE_NAME = 'push';


router.get('/', async (req, res) => {
  try {
    // Faz conexão com REDIS e cria/utiliza queue informada
    const queue = new Queue(QUEUE_NAME, `redis://${REDIS_HOST}:${REDIS_PORT}`);

    console.log(`Criando queue para ${QUEUE_NAME}... ${(new Date).getTime()}`);
    // Adicona job em queue
    const job = await queue.add({
      content: 'conteúdo salvo no redis'
    });

    console.log(`Queue ${QUEUE_NAME} criada! ${(new Date).getTime()}`);

    // Sleep por 1S
    await sleep(100);
    // Return jobID e success MSG

    return res.json({
      success: true,
      data: {
        id: job.id,
      }
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      data: error.message,
    });
  }
});

module.exports = router;
