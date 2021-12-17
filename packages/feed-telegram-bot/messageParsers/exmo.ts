import { Message } from '../messageCreators/exmo';

export function parser(message: Buffer): Message {
    return JSON.parse(String(message));
}