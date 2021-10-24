import { Worker } from "worker_threads";

export async function workerPoll(workers, logger) {
    let messages: any = Object.keys(workers).map(async (worker) => {
        const thisWorker: Worker = workers[worker].worker;
        thisWorker.postMessage({ ping: true });
        const message: any = await new Promise((resolve) => {
            const callback = (message) => { resolve(message) };
            thisWorker.on('message', callback);
            setTimeout(() => {
                thisWorker.removeListener('message', callback);
                resolve("timeout");
            }, 10000);
        });
        if(message == "timeout") {
            console.error(`${worker} timeout`);
            logger.error(`${worker} timeout`);
            workers[worker].isRunning = false;
            return `❌ Worker ${worker} is not running.`;
        }
        workers[worker].isRunning = true;
        return `✅ Worker ${worker} is running. Received ${message.stats} transactions`;
    })
    await Promise.all(messages);
    for(let i = 0; i < messages.length; i++) {
        messages[i] = await messages[i];
    }
    console.log(messages.join('\n'));
    logger.log(messages.join('\n'));
}