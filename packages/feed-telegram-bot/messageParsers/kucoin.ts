import { Message } from '../messageCreators/kucoin';

export function parser(message: Buffer): Message {
    const msg = JSON.parse(String(message));
    return {
        sequence: Number(msg.sequence),
        price: Number(msg.price),
        size: Number(msg.size),
        side: msg.side,
        time: msg.time
    }
}