// export interface Message {
//     // symbol: string; // The symbol of the requested ticker data
//     bid: number; // (float) Price of last highest bid
//     bidSize: number; // (float) Sum of the 25 highest bid sizes
//     ask: number; // (float) Price of last lowest ask
//     askSize: number; // (float) Sum of the 25 lowest ask sizes
//     dailyChange: number; // (float) Amount that the last price has changed since yesterday
//     dailyChangePerc: number; // (float) Relative price change since yesterday (*100 for percentage change)
//     lastPrice: number; // (float) Price of the last trade
//     volume: number; // (float) Daily volume
//     high: number; // (float) Daily high
//     low: number; // (float) Daily low
// }
// export interface Message {
//     type: "Trading" | "Funding",
//     price: number;
//     count: number; // Number of trades
//     amount: number;
// }

import { numWithCommas, generateDots } from "./Radix-uniswap"

export interface Message {
    type: "Bought" | "Sold";
    id: number; // ID of the trade
    mts: number; // millisecond time stamp
    amount: number; // millisecond time stamp (XRD)
    price: number; // Price at which the trade was executed
}

export function createMessage(options: Message, constants) {
    return `${options.type == "Bought" ? "🚀" : "👹"} *1 ${constants.token.substring(1,4)} = ${options.price.toFixed(4)} ${constants.token.substring(4)}T*\n`
    +   `${options.type} *${numWithCommas(Math.ceil(options.amount))} ${constants.token.substring(1,4)}* for *${numWithCommas(Math.ceil(options.amount * options.price))} ${constants.token.substring(4)}T* on Bitfinex\n\n`
    +   `${generateDots({ feedType: (options.type == "Bought" ? "uniswapBuy" : options.type), amountRadixInUsd: options.amount * options.price}, constants)}\n\n`
    +   `ℹ️ [Info](https://telegra.ph/Valar-List-of-informational-bots-03-23)`
}