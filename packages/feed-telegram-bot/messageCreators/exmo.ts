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
    let swapInUsd = options.anotherPrice ? (options.anotherPrice * +options.price) * +options.amount : +options.amount * +options.price
    return `${options.type == "buy" ? "🚀" : "👹"} *1 ${constants.token} = ${options.anotherPrice ? `${(options.anotherPrice * +options.price).toFixed(constants.priceDigit)} USD (${(+options.price).toFixed(6)} ${symbol})` : `${(+options.price).toFixed(constants.priceDigit)} ${symbol}`}*\n`
    +   `${options.type == "buy" ? "Bought" : "Sold"} *${numWithCommas(Math.ceil(+options.quantity))} ${constants.token}* for *${ options.anotherPrice ?  (+options.amount).toFixed(6) : numWithCommas(Math.ceil(+options.amount))} ${symbol}* on EXMO\n\n`
    +   `${generateDots({ feedType: (options.type == "buy" ? "uniswapBuy" : options.type), amountRadixInUsd: swapInUsd}, constants)}\n\n`
    +   `${constants.mainLink} | ✖️ [EXMO](${constants.tradeLinks[symbol]}) | 💥 [Powered by CERBY Token](https://t.me/CerbyToken)`
}