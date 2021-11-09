import { Message } from '../messageCreators/CERBY-staking';

export function validate(config, msg: Message): boolean {
    return (Number(+msg.stakedAmount * +msg.deftInUsd) >= config.minUSD) && (config.fromTimestamp < Number(msg.timestamp));
}