import { numWithCommas, generateDots, CerbyFinance } from "./helpers"

export interface Message {
    type: "sell" | "buy",
    vsSymbol: string,
    inTokens: number,
    price: number,
    anotherPrice?: number
}


export function createMessage(options: Message, constants) {
    console.log(options);
    let swapInUsd = options.anotherPrice ? (options.anotherPrice * +options.price) * +options.inTokens : +options.inTokens * +options.price
    return `${options.type == "buy" ? "🚀" : "👹"} *1 ${constants.token} = ${options.anotherPrice ? `${(options.anotherPrice * +options.price).toFixed(constants.priceDigit)} USD (${(+options.price).toFixed(6)} ${options.vsSymbol})` : `${(+options.price).toFixed(constants.priceDigit)} ${options.vsSymbol}`}*\n`
    +   `${options.type == "buy" ? "Bought" : "Sold"} *${numWithCommas(Math.ceil(+options.inTokens))} ${constants.token}* for *${options.anotherPrice ? (+options.inTokens * +options.price).toFixed(4) : numWithCommas(Math.ceil(+options.inTokens * +options.price))} ${options.vsSymbol}${options.anotherPrice ? ` (${numWithCommas(Math.ceil(swapInUsd))}$)` : ''}* on ${constants.type[0].toUpperCase() + constants.type.slice(1).toLowerCase()}\n\n`
    +   `${generateDots(swapInUsd, constants, options.type == "buy" ? "🟢" : "🔴")}\n\n`
    +   `${constants.mainLink} | ${constants.emoji} [${constants.type[0].toUpperCase() + constants.type.slice(1).toLowerCase()}](${constants.pair ? constants.tradeLink : constants.tradeLinks[options.vsSymbol]}) | ${CerbyFinance}`
}