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

async function publish(message: Buffer) {
    return String(message);
}

consumer.processMessages(publish, bot.sendMessage.bind(bot), workerData.withSync);