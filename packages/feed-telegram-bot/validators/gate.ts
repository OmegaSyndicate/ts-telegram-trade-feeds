import { Message } from '../messageCreators/gate';

export function validate(config, msg: Message): boolean {
    if(msg.anotherPrice) {
        return (+msg.amount * msg.anotherPrice * +msg.price) >= config.minUSD;
    }
    return (+msg.amount * +msg.price) >= config.minUSD;
}