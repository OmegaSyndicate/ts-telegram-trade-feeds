import { Kafka, KafkaMessage } from "kafkajs";
import { Logger } from '../logger';
import { v4 as uuidv4 } from 'uuid'
import { nextTick } from "process";

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
            if(err.type == "MESSAGE_TOO_LARGE") {
                for(let part = 0, size = Math.ceil(messages.length / 10); part < Math.ceil(messages.length / size);) {
                    console.log(part, size, )
                    await this.sendMessages(messages.slice(size * part, size * ++part));
                }
                this.logger?.log("This message was sent in chunks due to its large size.");
            }
            this.logger?.error(err);
            return 1;
        }

        await producer.disconnect();
        return -1;
    }

    async getLatestMessage(): Promise<KafkaMessage | undefined> {
        let groupId = `consumer-get-latest-${this.topic}`;
        const consumer = this.kafka.consumer({ groupId });
        const admin = this.kafka.admin();
        let latest_message = null;
        await admin.connect();
        let [{ high }] = await (async () => {
            try {
                return await admin.fetchTopicOffsets(this.topic)
            } catch(err) {
                if(String(err) == "KafkaJSNumberOfRetriesExceeded: This server does not host this topic-partition") {
                    this.logger.log("New topic");
                    await consumer.connect();
                    await consumer.subscribe({ topic: this.topic, fromBeginning: false});
                    return [{ high: 0 }];
                } else {
                    this.logger.error(err);
                    throw err;
                }
            }
        })();
        console.log(high);
        let interval;
        if(Number(high)) {
            while(true) {
                let rebalancingAttempts = 0;
                try {
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
                    console.log("Set offset ok");
                    break;
                } catch(err) {
                    console.log("ERROR", String(err));
                    if(String(err) == "KafkaJSNonRetriableError: The consumer group must have no running instances, current state: Stable") {
                        if(rebalancingAttempts > 120) {
                            this.logger.error(`The admin client has been waiting for more than 10 minutes for group rebalancing and consumer removal. Current waiting time: ${rebalancingAttempts * 5} seconds`)
                            throw err;
                        }
                        console.log("Waiting for rebalancing and removal of the consumer");
                        rebalancingAttempts++;
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        continue;
                    } else {
                        this.logger.error(err);
                        throw err;
                    }
                }
            }
            await consumer.connect();
            await consumer.subscribe({ topic: this.topic, fromBeginning: false});
            await consumer.run({ eachMessage: async ({ topic, message }) => { latest_message = message }});
            interval = setInterval(() => {
                if(latest_message == null && +high > 5) {
                    this.logger.error(`⛔️🆘\nTopic: ${this.topic}. The last message has not been received within 1 minute! The last transaction was not received with offset = ${+high - 2}.`)
                }
            }, 120000);
            setTimeout(() => {
                if(latest_message == null && +high < 5) {
                    this.logger.error(`Topic: ${this.topic}. The last transaction was not received with offset = ${+high - 2}. Synchronization is being performed again due to an error.`);
                    latest_message = undefined;
                }
            }, 120000);
            while(latest_message == null) {
                await new Promise(resolve => setTimeout(resolve, 15));
            }
        } else {
            latest_message = undefined;
        }
        consumer.disconnect();
        admin.disconnect();
        clearInterval(interval);
        return latest_message;
    }
}