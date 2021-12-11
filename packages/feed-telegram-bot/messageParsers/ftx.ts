import { Message } from '../messageCreators/ftx';

export function parser(message: Buffer): Message {
    return JSON.parse(String(message));
}