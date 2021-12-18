import { Message } from '../messageCreators/huobi';

export function parser(message: Buffer): Message {
    return JSON.parse(String(message));
}