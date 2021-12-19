import { Message } from '../messageCreators/zt';

export function parser(message: Buffer): Message {
    return JSON.parse(String(message));
}