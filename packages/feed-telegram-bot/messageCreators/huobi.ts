import { numWithCommas, generateDots } from "./Radix-uniswap"

export interface Message {
    id: number,
    ts: number,
    tradeId: number,
    amount: number,
    price: number,
    direction: 'sell' | 'buy'
}

export function createMessage(options: Message, constants) {
    let symbol = constants.pair;
    return `${options.direction == "buy" ? "🚀" : "👹"} *1 ${constants.token} = ${(+options.price).toFixed(2)} ${symbol}*\n`
    +   `${options.direction == "buy" ? "Bought" : "Sold"} *${numWithCommas(Math.ceil(+options.amount))} ${constants.token}* for *${numWithCommas(Math.ceil(+options.amount * +options.price))} ${symbol}* on Huobi\n\n`
    +   `${generateDots({ feedType: (options.direction == "buy" ? "uniswapBuy" : options.direction), amountRadixInUsd: +options.amount * +options.price}, constants)}\n\n`
    +   `${constants.mainLink} | 👌 [Huobi](${constants.tradeLink}) | 💥 [Powered by CERBY Token](https://t.me/CerbyToken)`
}