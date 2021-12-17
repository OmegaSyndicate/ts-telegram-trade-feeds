import { numWithCommas, generateDots } from "./Radix-uniswap"

export interface Message {
    id: number,
    price: number,
    size: number,
    side: "sell" | "buy",
    liquidation: boolean,
    time: Date
}

export function createMessage(options: Message, constants) {
    return `${options.side == "buy" ? "🚀" : "👹"} *1 ${constants.token} = ${options.price.toFixed(2)} USD*\n`
    +   `${options.side == "buy" ? "Покупка" : "Продажа"} *${numWithCommas(Math.ceil(options.size))} ${constants.token}* за *${numWithCommas(Math.ceil(options.size * options.price))} USD* на FTX\n\n`
    +   `${generateDots({ feedType: (options.side == "buy" ? "uniswapBuy" : options.side), amountRadixInUsd: options.size * options.price}, constants)}\n\n`
    +   `${constants.mainLink} | 📚 [FTX](${constants.tradeLink}) | 💥 [При поддержке CERBY Token](https://t.me/CerbyToken)`
}