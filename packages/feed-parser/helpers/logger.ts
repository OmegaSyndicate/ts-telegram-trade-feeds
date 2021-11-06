import { producerService } from "./kafkaServices/producerService";

export class Logger {
    readonly info: string;
    readonly sendMessage: producerService["sendMessages"];
    constructor(info: string, sendMessage: producerService["sendMessages"]) {
        this.info = info;
        this.sendMessage = sendMessage;
    }
    log(message: string) {
        console.log(message);
        return this.sendMessage([`Log at ${Date()} from ${this.info}\n${message}`]);
    }
    warn(message: string) {
        console.warn(message);
        return this.sendMessage([`Warn at ${Date()} from ${this.info}\n${message}\n\nStack trace: ${new Error().stack}`]);
    }
    error(message: string) {
        console.error(message);
        return this.sendMessage([`Error at ${Date()} from ${this.info}\n${message}\n\nStack trace: ${new Error().stack}`]);
    }
}