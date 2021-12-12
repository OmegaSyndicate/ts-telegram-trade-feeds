import { Message } from '../messageCreators/gate';

export function validate(config, msg: Message): boolean {
    return (+msg.amount * +msg.price) >= config.minUSD;
}