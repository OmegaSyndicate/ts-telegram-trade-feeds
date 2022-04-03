import { generateDots, CerbyFinance, numWithCommas } from "./helpers"

export interface Message {
    id: number,
    create_time: number,
    create_time_ms: string,
    side: "sell" | "buy",
    currency_pair: string,
    amount: string,
    price: string,
    anotherPrice?: number
}

export function createMessage(options: Message, constants) {
    console.log(options);
    let symbol = options.currency_pair.split('_')[1];
    let swapInUsd = options.anotherPrice ? (options.anotherPrice * +options.price) * +options.amount : +options.amount * +options.price
    return `${options.side == "buy" ? "🚀" : "👹"} *1 ${constants.token} = ${options.anotherPrice ? `${(options.anotherPrice * +options.price).toFixed(constants.priceDigit)} USD (${(+options.price).toFixed(6)} ${symbol})` : `${(+options.price).toFixed(constants.priceDigit)} ${symbol}`}*\n`
    +   `${options.side == "buy" ? "Bought" : "Sold"} *${numWithCommas(Math.ceil(+options.amount))} ${constants.token}* for *${options.anotherPrice ? (+options.amount * +options.price).toFixed(4) : numWithCommas(Math.ceil(+options.amount * +options.price))} ${symbol}${options.anotherPrice ? ` (${numWithCommas(Math.ceil(swapInUsd))}$)` : ''}* on Gate\n\n`
    +   `${generateDots(swapInUsd, constants, options.side == "buy" ? "🟢" : "🔴")}\n\n`
    +   `${constants.mainLink} | 🚪 [Gate.io](${constants.tradeLinks[symbol]}) | ${CerbyFinance}`
}