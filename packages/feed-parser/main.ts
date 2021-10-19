import { Worker } from 'worker_threads';
import { readFileSync, watch } from 'fs';
import { producerService } from './helpers/kafkaServices/producerService';
import { Logger } from './helpers/logger';
import { workerPoll } from './helpers/workerPoll';

let config = JSON.parse(readFileSync('../config.json').toString());

const workerInfo = `mainThreadParser-${config.mainWorkerName}`
const logProducer = new producerService("logs", `logger-${workerInfo}`, config.kafkaSettings);
const logger = new Logger(workerInfo, logProducer.sendMessages.bind(logProducer))
interface IWorkers {
    worker: Worker;
    config: Object;
    isRunning: boolean;
}

let workers: {[key: string]: IWorkers} = {};

function createWorker(token): Worker {
    const worker = new Worker('./worker/index.js', { workerData: token, stdout: true })
    const parserName = `parser-${token.token}-${token.type}`;
    worker.on('error', (err) => {
        logger.error(`${parserName}\n\n${err}`);
    });
    worker.on('message', (message) => {
        console.log(message);
    })
    worker.on('exit', (code) => {
        logger.error(`${parserName} stopped with code ${code}`);
    });
    return worker;
}

function workerKey(token, type) {
    return `${token}-${type}`;
}

config.tokens.forEach(token => {
    const key = workerKey(token.token, token.type);
    if(workers[key]) {
        console.error("Attention. Duplicate token found. Correct the config.")
        // Logger
    } else {
        token.kafkaSettings = config.kafkaSettings;
        delete token.publishers;
        workers[key] = {
             worker: createWorker(token),
             config: token,
             isRunning: false
        }
    }
});


workerPoll(workers, logger);
setInterval(workerPoll.bind(null, workers, logger), config.workerPoll * 1e3)