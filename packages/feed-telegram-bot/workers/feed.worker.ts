import { workerData, parentPort } from 'worker_threads';
import { consumerService } from '../helpers/kafkaServices/consumerService';
import { telegramBot } from '../helpers/telegramBot';
import { Logger } from '../../feed-parser/helpers/logger';
import { producerService } from '../../feed-parser/helpers/kafkaServices/producerService';
import { createImportSpecifier } from 'typescript';
// import { Logger } from '../helpers/logger';

const topic = `${workerData.token}-${workerData.type}${workerData.stakingType ? `-${workerData.stakingType}` : ''}`;
console.log("TOPIC", topic);
const workerInfo = `publisher-${topic}-${workerData.channel}`;
const logProducer = new producerService("logs", `logger-${workerInfo}`, workerData.kafkaSettings);
const logger = new Logger(workerInfo, logProducer.sendMessages.bind(logProducer))
const bot = new telegramBot(workerData.botToken, workerData.channel, logger, workerData.syncAmountPubs);
const consumer = new consumerService(topic, workerInfo, workerInfo, workerData.kafkaSettings, logger);

let stats = 0;

async function publish(workerData, message: Buffer) {
    try {
        const { parser } = await import(`../messageParsers/${workerData.parser ? workerData.parser : workerData.type}`);
        const { createMessage } = await import(`../messageCreators/${workerData.messageCreator ? workerData.messageCreator : workerData.type}`);
        const { validate } = await import(`../validators/${workerData.validator ? workerData.validator : workerData.type}`);
        const parsedMessage = await parser(message, logger);
        if(await validate(workerData, parsedMessage, logger)) {
            stats++;
            return await createMessage(parsedMessage, workerData, logger);
        } else {
            return false;
        }
    } catch(err) {
        console.error(err);
        logger.error(err);
    }
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