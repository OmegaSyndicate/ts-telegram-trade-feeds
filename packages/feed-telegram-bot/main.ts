import { Worker } from 'worker_threads';
import { readFileSync, watch } from 'fs';
import { Logger } from '../feed-parser/helpers/logger';
import { producerService } from '../feed-parser/helpers/kafkaServices/producerService';
import { workerPoll } from '../feed-parser/helpers/workerPoll';
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

let workerNum = 1;
let workerTimeoutStart = 10000; // 10 seconds
async function createPublisher(publisher, type): Promise<Worker> {
    await new Promise(resolve => setTimeout(resolve, workerTimeoutStart*workerNum++))
    const worker = new Worker(`./workers/${type}.worker`, { workerData: publisher, stdout: false })
    const publisherName = `publisher-${publisher.topic}-${publisher.channel}`;
    worker.on('error', (err) => {
        logger.error(`${publisherName} in file ${type}\n\n${err}`);
    });
    worker.on('exit', (code) => {
        logger.error(`${publisherName} in file ${type} stopped with code ${code}`);
    });
    return worker;
}

function publisherKey({ token, type, channel, stakingType }) {
    return `${token}-${type}-${channel}${stakingType ? `-${stakingType}` : ''}`;
}

// synchronizeParallelPublishers();
config.tokens.forEach(token => {
    if(token.publishers && token.publishers instanceof Array) {
        token.publishers.forEach(async (publisher: any) => {
            publisher.botToken = config.botToken;
            publisher.kafkaSettings = config.kafkaSettings;
            publisher.token = token.token;
            publisher.type = token.type;
            publisher.stakingType = token?.stakingType;
            const key = publisherKey(publisher);
            if(publishers[key]) {
                console.error("Attention. Duplicate token found. Correct the config.")
                // Logger
            } else {
                if(token.stakingTypes && token.stakingTypes instanceof Array) {
                    token.stakingTypes.forEach(async (stakingType) => {
                        publisher.stakingType = stakingType;
                        const config = { ...publisher };
                        const newKey = publisherKey(config);
                        publishers[newKey] = {
                            worker: await createPublisher(config, "feed"),
                            config,
                            isRunning: false
                        }
                    })
                } else {
                    const config = { ...publisher };
                    publishers[key] = {
                        worker: await createPublisher(config, "feed"),
                        config,
                        isRunning: false
                    }
                }
            }
        });
    }
});


// Logger
async function createLogger() {
    const logsPublisher = {
        botToken: config.botToken,
        channel: config.logsChat.channel,
        kafkaSettings: config.kafkaSettings,
        withSync: true,
        syncOffsetTime: 0,
        syncAmountPubs: 1
    }
    publishers['logs'] = {
        worker: await createPublisher(logsPublisher, "logger"),
        config: logsPublisher,
        isRunning: false
    }
}

createLogger()

// function synchronizeParallelPublishers(): void {
//     let publishers: { [channel: string]: { tokenIndex: number, publisherIndex: number }[] } = {};
//     config.tokens.forEach((token, tokenIndex) => {
//         if(token.publishers && token.publishers instanceof Array) {
//             token.publishers.forEach((publisher, publisherIndex) => {
//                 if(!publishers[publisher.channel]) {
//                     publishers[publisher.channel] = [];
//                 }
//                 publishers[publisher.channel].push({ tokenIndex, publisherIndex });
//             });
//         }
//     });
//     Object.keys(publishers).forEach(function (publisherChannel) {
//         let publisherList = publishers[publisherChannel];
//         let syncAmountPubs = publisherList.length;
//         publisherList.forEach((publisher, syncOffsetTime) => {
//             let pub = config.tokens[publisher.tokenIndex]
//                   .publishers[publisher.publisherIndex];
//             config.tokens[publisher.tokenIndex]
//                 .publishers[publisher.publisherIndex] = { ...pub, syncOffsetTime, syncAmountPubs };
//         })
//     })
// }

setTimeout(workerPoll.bind(null, publishers, logger), (workerNum + 1) * workerTimeoutStart);
setTimeout(console.log.bind(null, publishers, 1000))
setInterval(workerPoll.bind(null, publishers, logger), config.workerPoll * 1e3)