import { numWithCommas, generateDots, CerbyFinance } from "./helpers"

export interface Message {
    trade_id: number,
    price: string,
    quantity: string,
    amount: string,
    type: "sell" | "buy",
    date: Date,
    pair: string,
    anotherPrice?: number
}

export function createMessage(options: Message, constants) {
    let symbol = options.pair.split('_')[1];
    console.log(options);
    let swapInUsd = options.anotherPrice ? +options.amount * options.anotherPrice : +options.amount
    return `${options.type == "buy" ? "🚀" : "👹"} *1 ${constants.token} = ${options.anotherPrice ? `${(options.anotherPrice * +options.price).toFixed(constants.priceDigit)} USD (${(+options.price).toFixed(6)} ${symbol})` : `${(+options.price).toFixed(constants.priceDigit)} ${symbol}`}*\n`
    +   `${options.type == "buy" ? "Bought" : "Sold"} *${numWithCommas(Math.ceil(+options.quantity))} ${constants.token}* for *${ options.anotherPrice ?  (+options.amount).toFixed(6) : numWithCommas(Math.ceil(+options.amount))} ${symbol}${options.anotherPrice ? ` (${numWithCommas(Math.ceil(swapInUsd))}$)` : ''}* on EXMO\n\n`
    +   `${generateDots(swapInUsd, constants, options.type == "buy" ? "🟢" : "🔴")}`
    +   `${constants.mainLink} | ✖️ [EXMO](${constants.tradeLinks[symbol]}) | ${CerbyFinance}`
}