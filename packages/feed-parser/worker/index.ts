import { workerData, parentPort } from 'worker_threads';
import { producerService } from '../helpers/kafkaServices/producerService'
import { Logger } from '../helpers/logger';

const topic = `${workerData.token}-${workerData.type}`;
const workerInfo = `parser-${topic}`;

const logProducer = new producerService("logs", `logger-${workerInfo}`, workerData.kafkaSettings);
const logger = new Logger(workerInfo, logProducer.sendMessages.bind(logProducer));
const producer = new producerService(topic, workerInfo, workerData.kafkaSettings, logger);

let stats = 0;

async function synchronization() {
    const { sync } = await import(`../parsers/${workerData.type}`);
    const parser = sync(producer.getLatestMessage.bind(producer), workerData, logger);
    // Synchronization
    let data;
    while(true) {
        do {
            try {
                data = (await parser.next()).value;
            } catch(err) {
                console.error(err);
                logger.error(err);
                break;
            }
            if(data.length) {
                await producer.sendMessages(data);
                stats += data.length;
            }
        } while(data.length);
        await new Promise(resolve => setTimeout(resolve, workerData.synchronizeIntervalMs));
    }
}


synchronization();

setInterval(() => {
    parentPort.postMessage(`The ${workerInfo} received ${stats} transactions`);
}, 10000)

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