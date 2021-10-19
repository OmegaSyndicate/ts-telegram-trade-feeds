import { Message } from '../messageCreators/kucoin';

export function validate(config, msg: Message): boolean {
    return (msg.size * msg.price) >= config.minUSD;
}