import { Message } from '../messageCreators/okex';

export function validate(config, msg: Message): boolean {
    return (+msg.sz * +msg.px) >= config.minUSD;
}