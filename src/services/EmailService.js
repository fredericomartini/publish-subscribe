/**
 * Comando para criar arquivo baseado em fila
 */
const execute = require('./common/execute.js');

/**
 * Faz conexão com REDIS e cria queue "message"
 */
const queue = new Queue('message', `redis://${REDIS_HOST}:${REDIS_PORT}`);

const handleRequest = async (req, res) => {
  const job = await queue.add({
    content: 'trolololo'
  });

  console.log(`Gravando arquivo.. ${(new Date).getTime()}`);
  
  // Executa job, cria arquivo baseado em dados da fila
  execute('result-bull.txt', 'store', job.id);
  // Envia msg de success com id do JOB
  res.end(`{"success": true, "id": ${job.id}}`);
  
  console.log(`Arquivo gravado! ${(new Date).getTime()}`);


  /**
 * Env vars
 */
const {
    PORT,
    REDIS_HOST,
    REDIS_PORT,
  } = process.env;