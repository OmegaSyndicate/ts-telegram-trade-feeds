import { Message } from '../messageCreators/bitfinex';

export function parser(message: Buffer): Message {
    const msg = JSON.parse(String(message));
    return {
        type: msg[2] > 0 ? 'Bought' : 'Sold',
        id: msg[0],
        mts: msg[1],
        amount: Math.abs(msg[2]),
        price: msg[3]
    };
}