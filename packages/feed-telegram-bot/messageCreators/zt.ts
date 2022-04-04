import { numWithCommas, generateDots, CerbyFinance } from "./helpers"

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
    +   `${options.side == "buy" ? "Bought" : "Sold"} *${numWithCommas(Math.ceil(+options.amount))} ${constants.token}* for *${numWithCommas(Math.ceil(+options.amount * +options.price))} ${anotherSymbol}* on ZT\n\n`
    +   `${generateDots(+options.amount * +options.price, constants, options.side == "buy" ? "🟢" : "🔴")}\n\n`
    +   `${constants.mainLink} | 🇹 [ZT](${constants.tradeLink}) | ${CerbyFinance}`
}