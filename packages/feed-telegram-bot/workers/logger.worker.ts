import { workerData, parentPort } from 'worker_threads';
import { consumerService } from '../helpers/kafkaServices/consumerService';
import { telegramBot } from '../helpers/telegramBot';
import { Logger } from '../../feed-parser/helpers/logger';
import { producerService } from '../../feed-parser/helpers/kafkaServices/producerService';

const topic = `logs`;
const workerInfo = `publisher-${topic}-${workerData.channel}`;
let logProducer = new producerService("logs", `logger-${workerInfo}`, workerData.kafkaSettings);
const logger = new Logger(workerInfo, logProducer.sendMessages.bind(logProducer))
const bot = new telegramBot(workerData.botToken, workerData.channel, logger, false);
const consumer = new consumerService(topic, workerInfo, workerInfo, workerData.kafkaSettings, logger);


let stats = 0;
async function publish(message: Buffer) {
    stats++;
    return String(message);
}

consumer.processMessages(publish.bind(null, workerData), bot.sendMessage.bind(bot), workerData.syncOffsetTime, workerData.withSync);


parentPort.on("message", async (value) => {
    // worker threads do not have multiple listeners available for passing different event,
    // therefore add one onMessage listener, and pass an object with commands/data from main thread
    if (value?.exit) {
    // clean up
    const message = `Worker ${workerInfo} stopped`;
    await logger.log(message);
    console.log(message);
    process.exit(0);
    }
    if(value?.ping) {
        parentPort.postMessage({ workerInfo, isRunning: true, stats })
    }
});