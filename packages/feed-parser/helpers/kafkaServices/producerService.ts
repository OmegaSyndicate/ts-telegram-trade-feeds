import { Kafka, KafkaMessage } from "kafkajs";
import { Logger } from '../logger';
import { v4 as uuidv4 } from 'uuid'

export class producerService {
    readonly kafka: Kafka;
    topic: string;
    logger: Logger;
    constructor(topic, clientID, kafkaConfig, logger?) {
        this.topic = topic;
        this.logger = logger;
        this.kafka = new Kafka(Object.assign(clientID, kafkaConfig));
    }
    async sendMessages(messages: string[] | Buffer[]): Promise<number> {
        const producer = this.kafka.producer({
            maxInFlightRequests: 1,
            idempotent: true,
            transactionalId: `producer-transaction-${uuidv4()}`
        });
        await producer.connect();
        const transaction = await producer.transaction();
        try {
            await transaction.send({
                topic: this.topic,
                messages: messages.map(message => {
                    return { value: message }
                })
            });
            await transaction.commit();
        } catch(err) {
            await transaction.abort();
            this.logger?.error(err);
            return 1;
        }

        await producer.disconnect();
        return -1;
    }

    async getLatestMessage(): Promise<KafkaMessage | undefined> {
        let groupId = `consumer-get-latest-${uuidv4()}`;
        const consumer = this.kafka.consumer({ groupId });
        const admin = this.kafka.admin();
        let latest_message;
        await admin.connect();
        await consumer.connect();
        await consumer.subscribe({ topic: this.topic, fromBeginning: false});
        let [{ high }] = await admin.fetchTopicOffsets(this.topic);
        if(Number(high)) {
            await admin.setOffsets({
                groupId,
                topic: this.topic,
                partitions: [
                    {
                        partition: 0,
                        offset: String(Number(high) - 2)
                    }
                ]
            });
            await consumer.run({ eachMessage: async ({ topic, message }) => { latest_message = message }});
            while(!latest_message) {
                await new Promise(resolve => setTimeout(resolve, 15));
            }
        } else {
            latest_message = undefined;
        }
        admin.disconnect();
        consumer.disconnect();
        return latest_message;
    }
}