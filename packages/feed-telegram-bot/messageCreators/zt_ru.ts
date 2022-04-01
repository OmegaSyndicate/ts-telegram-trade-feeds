import { generateDots, numWithCommas, CerbyFinanceRU } from "./helpers"

export interface Message {
    amount: string,
    price: string,
    side: "buy" | "sell",
    timestamp: string,
    pair: string
}

export function createMessage(options: Message, constants) {
    let anotherSymbol = options.pair.split('_')[1];
    return `${options.side == "buy" ? "🚀" : "👹"} *1 ${constants.token} = ${(+options.price).toFixed(constants.priceDigit)} ${anotherSymbol}*\n`
    +   `${options.side == "buy" ? "Покупка" : "Продажа"} *${numWithCommas(Math.ceil(+options.amount))} ${constants.token}* за *${numWithCommas(Math.ceil(+options.amount * +options.price))} ${anotherSymbol}* на ZT\n\n`
    +   `${generateDots(+options.amount * +options.price, constants, options.side == "buy" ? "🟢" : "🔴")}`
    +   `${constants.mainLink} | 🇹 [ZT](${constants.tradeLink}) | ${CerbyFinanceRU}`
}