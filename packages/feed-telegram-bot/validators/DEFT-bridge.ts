import { Message } from '../messageCreators/DEFT-bridge';

export function validate(config, msg: Message): boolean {
    return (+msg.Mint.amount * +msg.price >= config.minUsd) && (config.fromTimestamp < Number(msg.Mint.timestamp));
}