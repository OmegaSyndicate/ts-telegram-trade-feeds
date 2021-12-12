import { Message } from '../messageCreators/gate';

export function parser(message: Buffer): Message {
    return JSON.parse(String(message));
}