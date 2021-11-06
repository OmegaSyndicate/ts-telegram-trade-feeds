import { Message } from '../messageCreators/DEFT-bridge';

export function validate(config, msg: Message): boolean {
    if(config.fromTimestamp) {
        return config.fromTimestamp < Number(msg.Mint.timestamp);
    }
    return true;
}