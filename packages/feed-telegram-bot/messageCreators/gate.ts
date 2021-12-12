import { numWithCommas, generateDots } from "./Radix-uniswap"

export interface Message {
    id: number,
    create_time: number,
    create_time_ms: string,
    side: "sell" | "buy",
    currency_pair: string,
    amount: string,
    price: string
}

export function createMessage(options: Message, constants) {
    let symbol = options.currency_pair.split('_')[1];
    return `${options.side == "buy" ? "🚀" : "👹"} *1 ${constants.token} = ${(+options.price).toFixed(4)} ${symbol}*\n`
    +   `${options.side == "buy" ? "Bought" : "Sold"} *${numWithCommas(Math.ceil(+options.amount))} ${constants.token}* for *${numWithCommas(Math.ceil(+options.amount * +options.price * 1000) / 1000)} ${symbol}* on Gate\n\n`
    +   `${generateDots({ feedType: (options.side == "buy" ? "uniswapBuy" : options.side), amountRadixInUsd: +options.amount * +options.price}, constants)}\n\n`
    +   `💠 [Gate.io](${constants.tradeLinks[symbol]}) | 💥 [Powered by CERBY Token](https://t.me/CerbyToken)`
}