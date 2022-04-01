import { numWithCommas, generateDots, CerbyFinance } from "./helpers"

export interface Message {
    id: number,
    ts: number,
    tradeId: number,
    amount: number,
    price: number,
    direction: 'sell' | 'buy'
}

export function createMessage(options: Message, constants) {
    let symbol = constants.currencypair;
    return `${options.direction == "buy" ? "🚀" : "👹"} *1 ${constants.token} = ${(+options.price).toFixed(4)} ${symbol}*\n`
    +   `${options.direction == "buy" ? "Bought" : "Sold"} *${numWithCommas(Math.ceil(+options.amount))} ${constants.token}* for *${numWithCommas(Math.ceil(+options.amount * +options.price))} ${symbol}* on Huobi\n\n`
    +   `${generateDots(+options.amount * +options.price, constants, options.direction == "buy" ? "🟢" : "🔴")}`
    +   `${constants.mainLink} | 🔥 [Huobi](${constants.tradeLink}) | ${CerbyFinance}`
}