import { Message } from '../messageCreators/exmo';

export function validate(config, msg: Message): boolean {
    if(msg.anotherPrice) {
        return (+msg.amount * msg.anotherPrice) >= config.minUSD;
    }
    return +msg.amount >= config.minUSD;
}