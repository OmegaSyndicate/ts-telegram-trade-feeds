import { Message } from '../messageCreators/defiplaza';

export function validate(config, msg: Message): boolean {
    return Number(msg.swapUSD) >= config.minUSD;
}