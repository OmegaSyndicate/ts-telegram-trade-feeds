import { generateDots, CerbyFinanceRU, numWithCommas } from "./helpers"

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
    return `${options.type == "buy" ? "🚀" : "👹"} *1 ${constants.token} = ${options.anotherPrice ? `${(options.anotherPrice * +options.price).toFixed(2)} USD (${(+options.price).toFixed(6)} ${symbol})` : `${(+options.price).toFixed(2)} ${symbol}`}*\n`
    +   `${options.type == "buy" ? "Покупка" : "Продажа"} *${numWithCommas(Math.ceil(+options.quantity))} ${constants.token}* за *${ options.anotherPrice ?  (+options.amount).toFixed(6) : numWithCommas(Math.ceil(+options.amount))} ${symbol}${options.anotherPrice ? ` (${numWithCommas(Math.ceil(swapInUsd))}$)` : ''}* на EXMO\n\n`
    +   `${generateDots(swapInUsd, constants, options.type == "buy" ? "🟢" : "🔴")}`
    +   `${constants.mainLink} | ✖️ [EXMO](${constants.tradeLinks[symbol]}) | ${CerbyFinanceRU}`
}