import { Message } from '../messageCreators/alephzero';

export function validate(config, msg: Message): boolean {
    return +msg.amount >= config.minALEPH;
}