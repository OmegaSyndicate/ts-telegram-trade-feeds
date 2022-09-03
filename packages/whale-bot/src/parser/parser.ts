import { Worker } from 'worker_threads';
import { Producer } from 'sqs-producer';
import { Config } from '../config';
import { MessageData } from '../shared/Tracker';
import { Message } from 'sqs-producer/dist/types';

async function setup() {

	let workers: Set<Worker> = new Set();

	// export AWS_SECRET_ACCESS_KEY=bpHUdn88W2Y9e5tuQY+BeDMZK7cTo+26dBxEaBB/
	// export AWS_ACCESS_KEY_ID=AKIA32LLCQBBOLZP7XV5

	// create SQS Producer
	const producer = Producer.create({
		queueUrl: 'https://sqs.eu-central-1.amazonaws.com/812510249026/whales-telegram',
		region: 'eu-central-1'
	});

	for (let workerConfig of Config.trackers) {

		const worker = new Worker(`./src/parser/worker/index.ts`, { workerData: workerConfig, stdout: true });
		const identifier = `${workerConfig.type}-${workerConfig.token}`;
		let counter = 0;

		worker.on('error', (err) => { throw err; });
		worker.on('exit', () => {
			workers.delete(worker);
			console.log(`Thread ${identifier} exiting, ${workers.size} running...`);
		});
		worker.on('message', async (msg) => {
			// console.log(workerConfig.type, msg);

			const queueData: string[] = [];
			
			msg.forEach(async (m: MessageData) => {
				const data = JSON.stringify({
					type: identifier,
					message: m
				});

				console.log(identifier, data, typeof data);

				counter++;

				await producer.send({
					id: `${identifier}-${counter}`,
					body: data
				} as Message);

				queueData.push(data);
			});

			// send messages to the queue
			// await producer.send(queueData);

			// get the current size of the queue
			const size = await producer.queueSize();
			console.log(`There are ${size} messages on the queue.`);
		});

		workers.add(worker);
	}

	console.log(`Running with ${workers.size} threads...`);
}

setup();