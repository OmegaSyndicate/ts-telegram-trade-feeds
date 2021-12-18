import { Message } from '../messageCreators/huobi';

export function validate(config, msg: Message): boolean {
    return (+msg.amount * +msg.price) >= config.minUSD;
}