import { Message } from '../messageCreators/alephzeroStaking';

export function validate(config, msg: Message): boolean {
    return (config.minALEPH ? +msg.amount >= config.minALEPH : true) && (config.minUSD ? +msg.amount * +msg.price >= config.minUSD : true) && msg.success;
}