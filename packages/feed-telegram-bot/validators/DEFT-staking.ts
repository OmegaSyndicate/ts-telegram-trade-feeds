import { Message } from '../messageCreators/DEFT-staking';

export function validate(config, msg: Message): boolean {
    if(config.fromTimestamp) {
        return config.fromTimestamp < Number(msg.timestamp);
    }
    return true;
}