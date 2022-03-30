import { Message } from '../messageCreators/wise-stakes';

export function validate(config, msg: Message): boolean {
    return Number((+msg.principal / 1e18) * msg.price) >= config.minUSD;
}