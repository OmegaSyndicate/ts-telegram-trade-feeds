import { generateDots, numWithCommas, CerbyFinanceRU } from "./helpers"

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
    +   `${generateDots(+options.sz * +options.px, constants, options.side == "buy" ? "🟢" : "🔴")}`
    +   `${constants.mainLink} | 👌 [Okex](${constants.tradeLinks[symbol]}) | ${CerbyFinanceRU}`
}