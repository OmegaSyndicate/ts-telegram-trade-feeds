import { Message } from '../messageCreators/uniswapv3';

export function validate(config, msg: Message): boolean {
    return Number(msg.amountUSD) >= config.minUSD;
}