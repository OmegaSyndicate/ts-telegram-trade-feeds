import { Kafka, Consumer } from "kafkajs";

export class consumerService {
    readonly kafka: Kafka;
    readonly consumer: Consumer;
    topic: string;
    logger;
    constructor(topic, clientID, groupId, kafkaConfig, logger) {
        this.topic = topic;
        this.logger = logger;
        this.kafka = new Kafka(Object.assign(clientID, kafkaConfig));
        this.consumer = this.kafka.consumer({ groupId });
    }

    async processMessages(messageParser, sendMessage, syncOffset, withSync = true) {
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: this.topic, fromBeginning: withSync });
        let firstStart = true;
        await this.consumer.run({
            autoCommitThreshold: 1,
            eachMessage: async({ topic, partition, message }) => {
                if(firstStart && syncOffset) {
                    await new Promise(resolve => setTimeout(resolve, syncOffset * 3000));
                }
                let status 
                try {
                    status = await sendMessage(await messageParser(message.value));
                    if(status instanceof Error) throw status;
                }
                catch (err) {
                    this.logger.error(err);
                    this.consumer.pause([{ topic, partitions: [partition] }])
                    // Other partitions will keep fetching and processing, until if / when
                    // they also get throttled
                    setTimeout(() => {
                        this.consumer.resume([{ topic, partitions: [partition] }])
                        // Other partitions that are paused will continue to be paused
                    }, 5000)
                    throw status;
                }
            }
        });
    }

    async disconnect() {
        await this.consumer.disconnect();
    }
}