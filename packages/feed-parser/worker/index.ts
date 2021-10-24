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
    try {
        const { sync } = await import(`../parsers/${workerData.type}`);
        const parser = sync(producer.getLatestMessage.bind(producer), workerData, logger);
        // Synchronization
        let data;
        while(true) {
            do {
                try {
                    data = (await parser.next()).value;
                    console.log("Data", data);
                    if(data == undefined || !data) {
                        throw new Error("Generator function returned undefined. Will reboot in 20 seconds.");
                    } else if(!(data instanceof Array)) {
                        throw new Error(`The generator function did not return an array. Will reboot in 20 seconds.\n${data}`)
                    }
                } catch(err) {
                    console.error(err);
                    logger.error(err);
                    await new Promise(resolve => setTimeout(resolve, 20000));
                    return synchronization();
                }
                if(data?.length) {
                    await producer.sendMessages(data);
                    stats += data?.length;
                }
            } while(data.length);
            await new Promise(resolve => setTimeout(resolve, workerData.synchronizeIntervalMs));
        }
    } catch(err) {
        logger.error(err);
        logger.log("Will reboot in 30 seconds.");
        await new Promise(resolve => setTimeout(resolve, 30000));
        return synchronization();
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