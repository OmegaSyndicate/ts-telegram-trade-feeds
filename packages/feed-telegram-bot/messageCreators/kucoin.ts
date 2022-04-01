import { numWithCommas, generateDots, CerbyFinance } from "./helpers"

export interface Message {
    sequence: number;
    price: number;
    size: number;
    side: 'sell' | 'buy';
    time: number; // Timestamp of the transaction
}

export function createMessage(options: Message, constants) {
    const tokens = constants.token.split('-'); // [0] - first token, [1] - last token
    return `${options.side == "buy" ? "🚀" : "👹"} *1 ${tokens[0]} = ${options.price.toFixed(4)} ${tokens[1]}*\n`
    +   `${options.side == "buy" ? "Bought" : "Sold"} *${numWithCommas(Math.ceil(options.size))} ${tokens[0]}* for *${numWithCommas(Math.ceil(options.size * options.price))} ${tokens[1]}* on Kucoin\n\n`
    +   `${generateDots(options.size * options.price, constants, options.side == "buy" ? "🟢" : "🔴")}`
    +   `🪙 [Kucoin](https://trade.kucoin.com/EXRD-USDT) | ${CerbyFinance}`
}