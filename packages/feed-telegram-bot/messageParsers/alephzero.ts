
import { Message } from '../messageCreators/alephzero';

export function parser(message: Buffer): Message {
    return JSON.parse(String(message));
}