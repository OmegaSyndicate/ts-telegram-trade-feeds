import { numWithCommas, generateDots } from "./Radix-uniswap"

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
    return `${options.side == "buy" ? "🚀" : "👹"} *1 ${constants.token} = ${(+options.px).toFixed(constants.priceDigit)} ${symbol}*\n`
    +   `${options.side == "buy" ? "Bought" : "Sold"} *${numWithCommas(Math.ceil(+options.sz))} ${constants.token}* for *${numWithCommas(Math.ceil(+options.sz * +options.px))} ${symbol}* on Okex\n\n`
    +   `${generateDots({ feedType: (options.side == "buy" ? "uniswapBuy" : options.side), amountRadixInUsd: +options.sz * +options.px}, constants)}\n\n`
    +   `${constants.mainLink} | 👌 [Okex](${constants.tradeLinks[symbol]}) | 💥 [Powered by Cerby Finance](https://cerby.fi)`
}