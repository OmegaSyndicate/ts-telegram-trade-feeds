import { Worker } from 'worker_threads';
import { readFileSync, watch } from 'fs';
import { Logger } from '../feed-parser/helpers/logger';
import { producerService } from '../feed-parser/helpers/kafkaServices/producerService';
// import * as config from '../config.json'

let config = JSON.parse(readFileSync('../config.json').toString());

const workerInfo = `mainThreadBot-${config.mainWorkerName}`
const logProducer = new producerService("logs", `logger-${workerInfo}`, config.kafkaSettings);
const logger = new Logger(workerInfo, logProducer.sendMessages.bind(logProducer))
interface IWorkers {
    worker: Worker;
    config: Object;
    isRunning: boolean;
}

let publishers: {[key: string]: IWorkers} = {};

function createPublisher(publisher, type): Worker {
    const worker = new Worker(`./workers/${type}.worker.js`, { workerData: publisher, stdout: true })
    const publisherName = `publisher-${publisher.topic}-${publisher.channel}`;
    worker.on('error', (err) => {
        logger.error(`${publisherName} in file ${type}\n\n${err}`);
    });
    worker.on('exit', (code) => {
        logger.error(`${publisherName} in file ${type} stopped with code ${code}`);
    });
    return worker;
}

function publisherKey({ token, type, channel }) {
    return `${token}-${type}-${channel}`;
}

config.tokens.forEach(token => {
    token.publishers.forEach((publisher: any) => {
        publisher.botToken = config.botToken;
        publisher.kafkaSettings = config.kafkaSettings;
        publisher.token = token.token;
        publisher.type = token.type;
        const key = publisherKey(publisher);
        if(publishers[key]) {
            console.error("Attention. Duplicate token found. Correct the config.")
            // Logger
        } else {
            publishers[key] = {
                worker: createPublisher(publisher, "feed"),
                config: publisher,
                isRunning: false
            }
        }
    });
    // createLogger();
});


// Logger
function createLogger() {
    const logsPublisher = {
        botToken: config.botToken,
        channel: config.logsChat.channel,
        kafkaSettings: config.kafkaSettings,
        withSync: true
    }
    publishers['logs'] = {
        worker: createPublisher(logsPublisher, "logger"),
        config: logsPublisher,
        isRunning: false
    }
}

createLogger()