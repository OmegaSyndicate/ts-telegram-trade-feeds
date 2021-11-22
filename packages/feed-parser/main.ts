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

function createWorker(token, key): Worker {
    const worker = new Worker('./worker', { workerData: token, stdout: true })
    const parserName = `parser-${key}`;
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

function workerKey(token, type, stakingType?) {
    return `${token}-${type}${stakingType ? `-${stakingType}` : ''}`;
}

config.tokens.forEach(token => {
    const key = workerKey(token.token, token.type, token?.stakingType);
    if(workers[key]) {
        console.error("Attention. Duplicate token found. Correct the config.")
        logger.error("Attention. Duplicate token found. Correct the config.")
    } else {
        token.kafkaSettings = config.kafkaSettings;
        delete token.publishers;
        if(token.stakingTypes && token.stakingTypes instanceof Array) {
            token.stakingTypes.forEach((el) => {
                token.stakingType = el;
                const newKey = workerKey(token.token, token.type, token.stakingType);
                workers[newKey] = {
                    worker: createWorker(token, key),
                    config: token,
                    isRunning: false
                }
            })
        } else {
            workers[key] = {
                worker: createWorker(token, key),
                config: token,
                isRunning: false
            }
        }
    }
});

setTimeout(workerPoll.bind(null, workers, logger), 3000);
setInterval(workerPoll.bind(null, workers, logger), config.workerPoll * 1e3)