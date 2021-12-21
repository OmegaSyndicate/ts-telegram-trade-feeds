import { Message } from '../messageCreators/cex';

export function validate(config, msg: Message): boolean {
    if(msg.anotherPrice) {
        return (+msg.inTokens * msg.anotherPrice * +msg.price) >= config.minUSD;
    }
    return (+msg.inTokens * +msg.price) >= config.minUSD;
}