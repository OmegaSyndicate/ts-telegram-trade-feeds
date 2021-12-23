import { generateDots } from "./Radix-uniswap"
import { numWithCommas } from "./ftx_ru";

export interface Message {
    instId: string, // pair
    tradeId: string,
    px: string, // price
    sz: string, // size
    side: 'sell' | 'buy',
    ts: string // timestamp
}

export function createMessage(options: Message, constants) {
    let symbol = options.instId.split('-')[1];
    return `${options.side == "buy" ? "🚀" : "👹"} *1 ${constants.token} = ${(+options.px).toFixed(2)} ${symbol}*\n`
    +   `${options.side == "buy" ? "Покупка" : "Продажа"} *${numWithCommas(Math.ceil(+options.sz))} ${constants.token}* за *${numWithCommas(Math.ceil(+options.sz * +options.px))} ${symbol}* на Okex\n\n`
    +   `${generateDots({ feedType: (options.side == "buy" ? "uniswapBuy" : options.side), amountRadixInUsd: +options.sz * +options.px}, constants)}\n\n`
    +   `${constants.mainLink} | 👌 [Okex](${constants.tradeLinks[symbol]}) | 💥 [При поддержке CERBY Token](https://t.me/CerbyToken)`
}