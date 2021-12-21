import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import { numWithCommas, generateDots } from "./Radix-uniswap"

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
    +   `${generateDots({ feedType: (options.type == "buy" ? "uniswapBuy" : options.type), amountRadixInUsd: swapInUsd}, constants)}\n\n`
    +   `${constants.mainLink} | ✖️ [EXMO](${constants.tradeLinks[symbol]}) | 💥 [При поддержке CERBY Token](https://t.me/CerbyToken)`
}