import { Worker } from 'worker_threads';
import { readFileSync, watch } from 'fs';

let config = JSON.parse(readFileSync('../config.json').toString());

interface IWorkers {
    worker: Worker;
    config: Object;
    isRunning: boolean;
}

let workers: {[key: string]: IWorkers} = {};

function createWorker(token): Worker {
    delete token.publishers;
    return new Worker('./worker/index.js', { workerData: token })
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
        workers[key] = {
             worker: createWorker(token),
             config: token,
             isRunning: false
        }
    }
});

// setTimeout(() => {
//     console.log(workers);
//     console.log(workers["LAMBO-uniswap-exrd"].worker.performance.eventLoopUtilization());
// }, 100)
// console.log(workers);

// createWorker(config.tokens[0]);