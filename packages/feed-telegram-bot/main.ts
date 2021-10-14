import { Worker } from 'worker_threads';
import { readFileSync, watch } from 'fs';
// import * as config from '../config.json'

let config = JSON.parse(readFileSync('../config.json').toString());

interface IWorkers {
    worker: Worker;
    config: Object;
    isRunning: boolean;
}

let publishers: {[key: string]: IWorkers} = {};

function createPublisher(publisher, type): Worker {
    return new Worker(`./workers/${type}.worker.js`, { workerData: publisher })
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