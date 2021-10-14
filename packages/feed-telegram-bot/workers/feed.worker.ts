import { workerData, parentPort } from 'worker_threads';
import { consumerService } from '../helpers/kafkaServices/consumerService';
import { telegramBot } from '../helpers/telegramBot';
import { Logger } from '../../feed-parser/helpers/logger';
import { producerService } from '../../feed-parser/helpers/kafkaServices/producerService';
// import { Logger } from '../helpers/logger';

const topic = `${workerData.token}-${workerData.type}`;
const workerInfo = `publisher-${topic}-${workerData.channel}`;
let logProducer = new producerService("logs", `logger-${workerInfo}`, workerData.kafkaSettings);
const logger = new Logger(workerInfo, logProducer.sendMessages.bind(logProducer))
const bot = new telegramBot(workerData.botToken, workerData.channel, logger);
const consumer = new consumerService(topic, workerInfo, workerInfo, workerData.kafkaSettings, logger);

async function publish(workerData, message: Buffer) {
    const { parser } = await import(`../messageParsers/${workerData.parser ? workerData.parser : workerData.type}`);
    const { createMessage } = await import(`../messageCreators/${workerData.messageCreator ? workerData.messageCreator : workerData.type}`);
    const { validate } = await import(`../validators/${workerData.validator ? workerData.validator : workerData.type}`);
    const parsedMessage = await parser(message);
    if(await validate(workerData, parsedMessage)) {
        console.log(await createMessage(parsedMessage));
        return await createMessage(parsedMessage, workerData);
    } else {
        return false;
    }
}

console.log("Started");

consumer.processMessages(publish.bind(null, workerData), bot.sendMessage.bind(bot), workerData.withSync);