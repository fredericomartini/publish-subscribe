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
const QUEUE_NAME = 'email';


router.get('/', async (req, res) => {
  try {
    // Faz conexão com REDIS e cria/utiliza queue informada
    const queue = new Queue(QUEUE_NAME, `redis://${REDIS_HOST}:${REDIS_PORT}`);

    console.log(`Criando queue para ${QUEUE_NAME}... ${(new Date).getTime()}`);

    // test p/ inserir 100 jobs ou um com priority
    const priority = false;

    // sem loop, com prioridade
    if (priority) {
      const job = await queue.add({
        content: `conteúdo salvo no redis loop nº: `
      }, {
          priority: 1,
          // removeOnComplete: true
        });
      console.log(`Job added ${QUEUE_NAME} jobID: ${job.id} ! ${(new Date).getTime()}`);

    } else {
      // Cria queue com 100 jobs
      // Adicona job em queue
      const job = await queue.add({
        content: 'conteúdo salvo no redis'
      });
      let i = 5;
      while (i--) {
        const job = await queue.add({
          content: `conteúdo salvo no redis loop nº: ${i}`
        }, {
            removeOnComplete: true,
            attempts: 3,
            removeOnFail: true,
          });
        console.log(`Job added ${QUEUE_NAME} jobID: ${job.id} ! ${(new Date).getTime()}`);
      }
    }

    console.log(`Queue ${QUEUE_NAME} criada! ${(new Date).getTime()}`);

    // Sleep por 1S
    // await sleep(100);
    // Return jobID e success MSG

    return res.json({
      success: true,
      // data: {
      //   id: job.id,
      // }
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
