import { Message } from '../messageCreators/ftx';

export function validate(config, msg: Message): boolean {
    return (msg.size * msg.price) >= config.minUSD;
}