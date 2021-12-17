import { Message } from '../messageCreators/okex';

export function parser(message: Buffer): Message {
    return JSON.parse(String(message));
}