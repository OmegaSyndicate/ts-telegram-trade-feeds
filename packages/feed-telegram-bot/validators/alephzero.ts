import { Message } from '../messageCreators/alephzero';

export function validate(config, msg: Message): boolean {
    if((config.noDeposit && msg.feedType == 'deposit') || (config.noWithDraw && msg.feedType == 'withdraw')) {
        return false; 
    }
    return +msg.amount >= config.minALEPH;
}