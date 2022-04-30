
import { Message } from '../messageCreators/alephzeroStaking';

export function parser(message: Buffer): Message {
    return JSON.parse(String(message));
}