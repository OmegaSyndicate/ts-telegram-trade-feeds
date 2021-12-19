import { Message } from '../messageCreators/zt';

export function validate(config, msg: Message): boolean {
    return (+msg.amount * +msg.price) >= config.minUSD;
}