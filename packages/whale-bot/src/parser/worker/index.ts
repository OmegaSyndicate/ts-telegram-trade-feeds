import { parentPort, workerData } from "worker_threads";

async function start() {
	const module = await import(`../../shared/trackers/${workerData.type}`);

	const tracker = new module[workerData.type](workerData);
	tracker.start();
}

start();
